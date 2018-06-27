# Recursively renames keys.
def renameKey(iterable, oldKey, newKey):
    if type(iterable) is dict:
        for key in iterable.keys():
            iterable[key] = renameKey(iterable[key], oldKey, newKey)
            if key == oldKey:
                iterable[newKey] = iterable.pop(key)
    return iterable