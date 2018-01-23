import * as React from 'react';
function VersionSelect(props) {
    let versions = [];
    for (let i = 1; i <= props.value; i++) {
        versions.push(i);
    }
    return (
        <div className="col-12">
            {props.title} - Version:
            <select className="form-control" value={props.value} onChange={props.onChange}>
                <option value="NEW">New version...</option>
                {versions.map(version => 
                    <option key={version} value={version}>{version}</option>    
                )}
                
            </select>
        </div>
    )
}
export default VersionSelect;