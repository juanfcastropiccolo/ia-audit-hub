"""Simple logging helper for the Audit‑IA backend.

Why a custom helper?
--------------------
* Ensures *consistent* log format across CLI, FastAPI, background workers, etc.
* Lets you set the log‑level via env‑var without repeating boilerplate.
* Adds coloured output in local dev (optional) while remaining plain in prod.

Usage
-----
```python
from backend.utils.logger import setup_logger

log = setup_logger(__name__)
log.info("Server started on %s", host_url)
```

By default it respects an env‑var `LOG_LEVEL` (DEBUG, INFO, WARNING, …).  If
nothing is set it falls back to *INFO*.
"""

from __future__ import annotations

import logging
import os
from typing import Optional

# ---------------------------------------------------------------------------
# Public helper
# ---------------------------------------------------------------------------

def setup_logger(name: Optional[str] = None, *, level: str | int | None = None) -> logging.Logger:
    """Return a configured ``logging.Logger`` instance.

    Parameters
    ----------
    name:
        Logger name.  ``None`` (default) → root logger.
    level:
        Overrides the level (e.g. `"DEBUG"`). If ``None`` we read env var
        `LOG_LEVEL` and default to *INFO*.
    """

    # Choose level hierarchy: explicit arg > env var > INFO
    if level is None:
        level = os.getenv("LOG_LEVEL", "INFO")
    level = level if isinstance(level, int) else level.upper()

    logger = logging.getLogger(name)

    if logger.handlers:
        # Already configured elsewhere (avoid duplicates)
        logger.setLevel(level)
        return logger

    logger.setLevel(level)

    # Formatter – date + level + module:line – message
    formatter = logging.Formatter(
        fmt="%(asctime)s │ %(levelname)-8s │ %(name)s:%(lineno)d │ %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Stream handler (stdout)
    sh = logging.StreamHandler()
    sh.setFormatter(formatter)
    logger.addHandler(sh)

    # Prevent log propagation unless explicitly wanted
    logger.propagate = False

    return logger


# ---------------------------------------------------------------------------
# Convenience: create a module‑level logger so you can do `from backend.utils
# import log` for quick‑and‑dirty scripts.
# ---------------------------------------------------------------------------

log = setup_logger("audit-ia")
