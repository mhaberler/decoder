"""Check that device conditions are compatible with the match bucket index.

Mirrors collectConditionKeys / conditionNeedsFallback in src/decoder.cpp.
checkDeviceMatch evaluates left to right without precedence, so
"A | B & C" means "(A | B) & C": a condition is an AND of OR-groups.
A condition that is not on the fallback list needs at least one OR-group
whose every term carries an "index", 0, "<hex>" prefix (>= 2 nibbles);
otherwise a matching advertisement may hit no bucket and skip the device.

Run from the repository root.
"""
import json
import re
import sys
from pathlib import Path

JSON_DECL = re.compile(r'const char\* (_\w+_json) = "(.*?)";\n')


def flatten(condition):
    """Yield condition tokens, descending into nested arrays."""
    for token in condition:
        if isinstance(token, list):
            yield from flatten(token)
        else:
            yield token


def is_index(token) -> bool:
    """Return True for "index" tokens other than "mac@index"."""
    return isinstance(token, str) and "index" in token and "mac@" not in token


def needs_fallback(condition) -> bool:
    """Port of conditionNeedsFallback()."""
    tokens = list(flatten(condition))
    for i, token in enumerate(tokens):
        if not isinstance(token, str):
            continue
        if (
            "no-mfgdata" in token
            or ("name" in token and "manufacturerdata" not in token)
            or "contain" in token
            or "mac@index" in token
        ):
            return True
        if is_index(token) and i + 1 < len(tokens):
            offset = tokens[i + 1]
            if isinstance(offset, int) and offset != 0:
                return True
    return False


def has_prefix_key(term) -> bool:
    """Return True if term contains an "index", 0, "<hex>" prefix."""
    tokens = list(flatten(term))
    return any(
        is_index(token)
        and i + 2 < len(tokens)
        and tokens[i + 1] == 0
        and isinstance(tokens[i + 2], str)
        and len(tokens[i + 2]) >= 2
        for i, token in enumerate(tokens)
    )


def or_groups(condition) -> list:
    """Split condition into AND-ed groups, each a list of OR-ed terms."""
    groups = [[[]]]
    for token in condition:
        if token == "&":
            groups.append([[]])
        elif token == "|":
            groups[-1].append([])
        else:
            groups[-1][-1].append(token)
    return groups


def is_reachable(condition) -> bool:
    """Return True if every matching ad is guaranteed to hit a bucket or fallback."""
    if needs_fallback(condition):
        return True
    return any(all(has_prefix_key(term) for term in group) for group in or_groups(condition))


if __name__ == "__main__":
    assert not is_reachable(
        ["manufacturerdata", ">=", 10, "|", "servicedata", "index", 0, "ab"]
    ), "self-test: unkeyed OR term not detected"
    assert is_reachable(
        ["servicedata", "index", 0, "1", "|", "servicedata", "index", 0, "2", "&", "uuid", "index", 0, "181a"]
    ), "self-test: keyed AND group not accepted"

    has_error = False
    for filename in sorted(Path("src/devices").glob("*_json.h")):
        content = filename.read_text()
        for match in JSON_DECL.finditer(content):
            if match.group(1).endswith("_props"):
                continue
            device = json.loads(match.group(2).replace('\\"', '"').replace("\\\\", "\\"))
            for key in ("condition", "conditionnomac"):
                if key not in device:
                    continue
                if not is_reachable(device[key]):
                    print(f"{filename}: {device['model_id']} {key} may miss all buckets: {device[key]}")
                    has_error = True

    if has_error:
        sys.exit(1)
