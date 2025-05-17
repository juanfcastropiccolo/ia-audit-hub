"""
Audit‑specific helper classes to be used by the auditing agents.
Each tool is designed to work independently (so you can unit‑test them in
isolation) yet they can also be chained together inside your agent’s
workflow.  All public methods return plain Python or pandas objects so
any upstream logic—LLM calls, web UIs, report exporters—can consume the
results without extra serialization steps.

Dependencies
------------
* pandas ≥ 1.5 (install with `pip install pandas`)

Example
-------
```python
from backend.tools.audit_tools import (
    BalanceSheetAuditor,
    TransactionVerifier,
    ComplianceChecker,
    ReportGenerator,
)

bs_auditor = BalanceSheetAuditor()
bs_result  = bs_auditor.audit(balance_sheet_df)

trx_verifier = TransactionVerifier()
trx_issues   = trx_verifier.verify(transactions_df)

compliance_checker = ComplianceChecker()
compl_issues       = compliance_checker.check(policy_docs)

reporter = ReportGenerator()
print(reporter.generate(bs_result, trx_issues, compl_issues))
```
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

import pandas as pd

__all__ = [
    "BalanceSheetAuditor",
    "TransactionVerifier",
    "ComplianceChecker",
    "ReportGenerator",
]


# ─────────────────────────────────────────────────────────────────────────────
# Utility / shared bits
# ─────────────────────────────────────────────────────────────────────────────


def _ensure_columns(df: pd.DataFrame, required: set[str]):
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"DataFrame is missing required columns: {', '.join(sorted(missing))}")


# ─────────────────────────────────────────────────────────────────────────────
# Tool #1 – Balance‑sheet sanity checks & ratio analysis
# ─────────────────────────────────────────────────────────────────────────────


class BalanceSheetAuditor:
    """Run accounting‑equation checks and quick‑ratio analysis on a balance‑sheet.*

    The **minimum** schema expected is:

    | column   | dtype  | description                                  |
    |----------|--------|----------------------------------------------|
    | account  | object | account name (e.g. *Cash & Cash Equivalents*)|
    | type     | object | one of ``asset``, ``liability``, ``equity``  |
    | amount   | float  | monetary value (same currency everywhere)    |

    Anything beyond that is ignored but preserved.
    """

    _REQ_COLS = {"account", "type", "amount"}

    def __init__(self, *, materiality_threshold: float = 0.01):
        """Create an auditor.

        Parameters
        ----------
        materiality_threshold:
            Differences (e.g. Assets − (Liabilities + Equity)) larger than this
            fraction of total assets are flagged.
        """

        self.materiality_threshold = materiality_threshold
        self.findings: List[str] = []

    # ---------------------------------------------------------------------
    # Public API
    # ---------------------------------------------------------------------

    def audit(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Return key ratios and any findings as a dict."""

        _ensure_columns(df, self._REQ_COLS)

        # Totals
        total_assets = df.loc[df["type"].str.lower() == "asset", "amount"].sum()
        total_liab   = df.loc[df["type"].str.lower() == "liability", "amount"].sum()
        total_equity = df.loc[df["type"].str.lower() == "equity", "amount"].sum()

        self.findings.clear()
        if abs(total_assets - (total_liab + total_equity)) > self.materiality_threshold * max(total_assets, 1):
            self.findings.append(
                (
                    "Accounting equation mismatch: Assets "
                    f"({total_assets:,.0f}) ≠ Liabilities+Equity ({(total_liab + total_equity):,.0f})."
                )
            )

        # Liquidity – using a naive *current* keyword search (customise if needed)
        current_assets = df.loc[
            (df["type"].str.lower() == "asset") & df["account"].str.contains("current", case=False),
            "amount",
        ].sum()
        current_liab = df.loc[
            (df["type"].str.lower() == "liability") & df["account"].str.contains("current", case=False),
            "amount",
        ].sum()
        current_ratio = current_assets / current_liab if current_liab else None

        return {
            "totals": {
                "assets": total_assets,
                "liabilities": total_liab,
                "equity": total_equity,
            },
            "current_ratio": current_ratio,
            "findings": list(self.findings),
        }

    # ------------------------------------------------------------------
    # Pretty helpers
    # ------------------------------------------------------------------

    def __repr__(self) -> str:  # pragma: no cover
        return f"<BalanceSheetAuditor materiality={self.materiality_threshold:.0%}>"


# ─────────────────────────────────────────────────────────────────────────────
# Tool #2 – Transaction anomaly detector
# ─────────────────────────────────────────────────────────────────────────────


class TransactionVerifier:
    """Identify duplicate and unbalanced journal entries.

    Expected columns:
        * ``date``  – datetime‑like or string parseable (YYYY‑MM‑DD …)
        * ``account``
        * ``debit``  – numeric (0/1 flags are allowed)
        * ``credit`` – numeric (0/1 flags are allowed)
        * ``amount`` – numeric
    """

    _REQ_COLS = {"date", "account", "debit", "credit", "amount"}

    def __init__(self):
        self.anomalies: Optional[pd.DataFrame] = None

    def verify(self, df: pd.DataFrame, *, duplicate_window: str | pd.Timedelta = "1D") -> pd.DataFrame:
        """Return a DataFrame with all detected anomalies (may be empty)."""

        _ensure_columns(df, self._REQ_COLS)
        out_frames: List[pd.DataFrame] = []

        # Normalise date column
        df = df.copy()
        df["date"] = pd.to_datetime(df["date"], errors="coerce")

        # Duplicates – same account+amount within *duplicate_window*
        dupes = (
            df.sort_values("date")
            .set_index("date")
            .groupby([pd.Grouper(freq=duplicate_window), "account", "amount"])
            .filter(lambda g: len(g) > 1)
        )
        if not dupes.empty:
            dupes["issue"] = "potential duplicate"
            out_frames.append(dupes)

        # Unbalanced entries – both debit & credit flags set or both unset
        unbalanced = df[((df["debit"] == 1) & (df["credit"] == 1)) | ((df["debit"] == 0) & (df["credit"] == 0))]
        if not unbalanced.empty:
            unbalanced["issue"] = "unbalanced entry"
            out_frames.append(unbalanced)

        self.anomalies = pd.concat(out_frames).drop_duplicates() if out_frames else pd.DataFrame(columns=df.columns.tolist() + ["issue"])
        return self.anomalies

    def __repr__(self) -> str:  # pragma: no cover
        if self.anomalies is None:
            return "<TransactionVerifier (not run yet)>"
        return f"<TransactionVerifier anomalies={len(self.anomalies)}>"


# ─────────────────────────────────────────────────────────────────────────────
# Tool #3 – Basic regulatory compliance checklist
# ─────────────────────────────────────────────────────────────────────────────


class ComplianceChecker:
    """Check presence/completeness of key policy / control documents.

    `docs` is expected to be a mapping ─ each key is the policy/control name and
    the value is either a string (path / URL), a bool (present flag) or
    anything truthy/falsey.
    """

    def __init__(self, checklist: Optional[List[str]] = None):
        self.checklist = checklist or [
            "SOX 302 Certification",
            "SOX 404 Testing",
            "IFRS Disclosure Notes",
            "Code of Ethics",
        ]
        self.issues: Dict[str, str] = {}

    def check(self, docs: Dict[str, Any]) -> Dict[str, str]:
        self.issues.clear()
        for item in self.checklist:
            if not docs.get(item):
                self.issues[item] = "missing or empty"
        return dict(self.issues)

    def __repr__(self):  # pragma: no cover
        return f"<ComplianceChecker pending={len(self.issues)}>"


# ─────────────────────────────────────────────────────────────────────────────
# Tool #4 – Human‑readable report generator
# ─────────────────────────────────────────────────────────────────────────────


class ReportGenerator:
    """Combine results from the other tools into a plaintext report."""

    def generate(
        self,
        balance_sheet_result: Dict[str, Any],
        transaction_anomalies: Optional[pd.DataFrame] = None,
        compliance_issues: Optional[Dict[str, str]] = None,
    ) -> str:
        """Return a multi‑section plaintext report suitable for LLM consumption."""

        lines: List[str] = [
            "=" * 70,
            "AUDIT SUMMARY REPORT",
            "=" * 70,
            "",
            "# Balance‑sheet overview",
            f"Total assets      : {balance_sheet_result['totals']['assets']:,.0f}",
            f"Total liabilities : {balance_sheet_result['totals']['liabilities']:,.0f}",
            f"Total equity      : {balance_sheet_result['totals']['equity']:,.0f}",
        ]

        cr = balance_sheet_result.get("current_ratio")
        if cr is not None:
            lines.append(f"Current ratio     : {cr:.2f}")

        if balance_sheet_result.get("findings"):
            lines.append("\nFindings:")
            for finding in balance_sheet_result["findings"]:
                lines.append(f"  • {finding}")
        else:
            lines.append("\nNo balance‑sheet exceptions detected.")

        # ------------------------------------------------------------------
        lines.append("\n# Transaction testing")
        if transaction_anomalies is not None and not transaction_anomalies.empty:
            lines.append(f"Detected anomalies: {len(transaction_anomalies)} entries.")
            # Show first 5 for brevity
            preview = transaction_anomalies.head(5).to_string(index=False)
            lines.extend(["", preview])
            if len(transaction_anomalies) > 5:
                lines.append("… (truncated)")
        else:
            lines.append("No anomalies detected in transactions.")

        # ------------------------------------------------------------------
        lines.append("\n# Compliance checklist")
        if compliance_issues:
            for k, v in compliance_issues.items():
                lines.append(f"  • {k}: {v}")
        else:
            lines.append("All mandatory policies and controls are present.")

        return "\n".join(lines)

    # ------------------------------------------------------------------
    def __repr__(self):  # pragma: no cover
        return "<ReportGenerator>"
