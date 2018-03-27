import * as React from 'react';
function VersionSelect(props) {
    return (
        <div className="col-12">
            {props.title} - {props.id} - Version:
            <select className="form-control form-control-sm" value={props.value} onChange={props.onChange}>
                <option value="NEW">Create new version</option>
                {props.versions.map(item => 
                    <option key={item.version} value={item.version}>
                        Version {item.version} ({formatDate(item.date_last_modified, "M: ")} {formatDate(item.date_created, "C: ")})
                    </option>    
                )}
                // todo: date modified, etc.
            </select>
        </div>
    )
}
function formatDate(date, prefix="") {
    if (!date) return "";
    let dateObj = new Date(date);
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    return prefix + month + "/" + day + "/" + year;
}
export default VersionSelect;