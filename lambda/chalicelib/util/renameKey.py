# Recursively renames keys.
def renameKey(iterable, oldKey, newKey):
    if type(iterable) is dict:
        for key in list(iterable.keys()):
            iterable[key] = renameKey(iterable[key], oldKey, newKey)
            if key == oldKey:
                iterable[newKey] = iterable.pop(key)
    if type(iterable) is list:
        for i, item in enumerate(iterable):
            iterable[i] = renameKey(iterable[i], oldKey, newKey)
    return iterable

# Recursively replaces a character in keys.
def replaceKey(iterable, old, new):
    if type(iterable) is dict:
        for key in list(iterable.keys()):
            iterable[key.replace(old, new)] = replaceKey(iterable.pop(key), old, new)
    if type(iterable) is list:
        for i, item in enumerate(iterable):
            iterable[i] = replaceKey(iterable[i], old, new)
    return iterable