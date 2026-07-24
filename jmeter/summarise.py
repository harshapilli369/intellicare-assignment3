#!/usr/bin/env python3
"""Summarise JMeter dashboard statistics as a markdown table.

Reads the statistics.json that JMeter writes when a run is generated with
``-e -o``. With one report it prints the metrics for that run; with two it
prints a before/after comparison including percentage change.

    python jmeter/summarise.py results/baseline/light-report
    python jmeter/summarise.py results/baseline/light-report results/optimized/light-report
"""

import json
import sys
from pathlib import Path

METRICS = [
    ("meanResTime", "Avg (ms)", 0),
    ("pct2ResTime", "p95 (ms)", 0),
    ("throughput", "Req/s", 2),
    ("errorPct", "Error %", 2),
]


def load(report_dir):
    path = Path(report_dir) / "statistics.json"
    if not path.exists():
        sys.exit(f"No statistics.json in {report_dir}")
    return json.loads(path.read_text())


def order(stats):
    """Samplers in plan order, with the Total row last."""
    labels = [k for k in stats if k != "Total"]
    return sorted(labels) + (["Total"] if "Total" in stats else [])


def fmt(value, places):
    return f"{value:,.{places}f}"


def change(before, after):
    """Percentage reduction. Positive means the metric improved."""
    if before == 0:
        return "n/a"
    delta = (before - after) / before * 100
    return f"{delta:+.1f}%".replace("+", "-", 1) if delta < 0 else f"-{delta:.1f}%"


def single(stats):
    header = ["Endpoint", "Samples"] + [label for _, label, _ in METRICS]
    rows = [header, ["---"] * len(header)]
    for key in order(stats):
        row = stats[key]
        rows.append(
            [key, f"{row['sampleCount']:,}"]
            + [fmt(row[metric], places) for metric, _, places in METRICS]
        )
    return rows


def compare(before, after):
    header = ["Endpoint"]
    for _, label, _ in METRICS:
        header += [f"{label} before", f"{label} after", "Change"]
    rows = [header, ["---"] * len(header)]

    for key in order(before):
        if key not in after:
            continue
        row = [key]
        for metric, _, places in METRICS:
            b, a = before[key][metric], after[key][metric]
            row += [fmt(b, places), fmt(a, places), change(b, a)]
        rows.append(row)
    return rows


def render(rows):
    widths = [max(len(r[i]) for r in rows) for i in range(len(rows[0]))]
    for index, row in enumerate(rows):
        cells = [
            ("-" * widths[i] if index == 1 else row[i].ljust(widths[i]))
            for i in range(len(row))
        ]
        print("| " + " | ".join(cells) + " |")


def main():
    if len(sys.argv) == 2:
        render(single(load(sys.argv[1])))
    elif len(sys.argv) == 3:
        render(compare(load(sys.argv[1]), load(sys.argv[2])))
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
