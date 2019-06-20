from jsonpatch import JsonPatch, JsonPatchTestFailed

def convert_to_json_patches(input):
    if input["type"] == "patches":
        return input["value"]
    if input["type"] == "patch":
        return [input["value"]]
    if input["type"] == "walk":
        patches = []
        patches.append([{ "op": "add", "path": "/CFF_PATCHED", "value": False }])
        items = input["items"]
        pairs_of_items = zip(items, items[1:])
        for (first, second) in pairs_of_items:
            patches.append([
                { "op": "test", "path": "/grade", "value": first },
                { "op": "test", "path": "/CFF_PATCHED", "value": False },
                { "op": "replace", "path": "/grade", "value": second },
                { "op": "replace", "path": "/CFF_PATCHED", "value": True }
            ])
        patches.append([{ "op": "remove", "path": "/CFF_PATCHED"}])
        return patches

def patch_predicate(value, patches):
    patched_value = value
    for patch in patches:
        json_patch_list = convert_to_json_patches(patch)
        for patch in json_patch_list:
            try:
                patched_value = JsonPatch(patch).apply(patched_value)
            except JsonPatchTestFailed:
                pass
    return patched_value
