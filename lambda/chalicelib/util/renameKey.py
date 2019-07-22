# Recursively renames keys.
def renameKey(iterable, oldKey, newKey):
    if type(iterable) is dict:
        for key in iterable.keys():
            iterable[key] = renameKey(iterable[key], oldKey, newKey)
            if key == oldKey:
                iterable[newKey] = iterable.pop(key)
    if type(iterable) is list:
        for i, item in enumerate(iterable):
            iterable[i] = renameKey(iterable[i], oldKey, newKey)
    return iterable