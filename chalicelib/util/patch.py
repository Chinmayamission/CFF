from jsonpatch import JsonPatch, JsonPatchTestFailed, JsonPatchConflict
from pydash.objects import get
from jsonpointer import resolve_pointer
import itertools

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
                { "op": "test", "path": input["path"], "value": first },
                { "op": "test", "path": "/CFF_PATCHED", "value": False },
                { "op": "replace", "path": input["path"], "value": second },
                { "op": "replace", "path": "/CFF_PATCHED", "value": True }
            ])
        patches.append([{ "op": "remove", "path": "/CFF_PATCHED"}])
        return patches

def unwind(input, data):
    input = dict(input)
    unwind_json_pointer = input.pop("unwind")
    num_elements = len(resolve_pointer(data, unwind_json_pointer, []))
    if input["type"] == "walk" and "path" in input:
        return [dict(input, path=f"{unwind_json_pointer}/{i}{input['path']}") for i in range(0, num_elements)]
    elif "value" in input:
        results = []
        value = input.pop("value")
        for idx, item in enumerate(value):
            if "path" in value[idx]:
                for i in range(0, num_elements):
                    results.append(dict(input, value=[dict(value[idx], path=f"{unwind_json_pointer}/{i}{value[idx]['path']}")] ))
        return results # Flatten list of lists

def patch_predicate(value, patches):
    patched_value = value
    for patch in patches:
        if "unwind" in patch:
            json_patch_list = [convert_to_json_patches(p) for p in unwind(patch, value)]
            json_patch_list = itertools.chain(*json_patch_list) # Flatten list of lists
        else:
            json_patch_list = convert_to_json_patches(patch)
        for patch in json_patch_list:
            try:
                patched_value = JsonPatch(patch).apply(patched_value)
            except (JsonPatchTestFailed, JsonPatchConflict):
                pass
    return patched_value
