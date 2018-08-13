import { IHeaderObject } from "../util/Headers";
import Papa from "papaparse";
import FileSaver from "file-saver";

export default function downloadCSV(headers: IHeaderObject[], data, filename: string) {
    const csv = Papa.unparse({
        fields: headers.map(e => e.Header),
        data: data.map(response =>
            headers.map(header =>
                header.Cell({ "value": header.accessor(response) })
            )
        )
    });
    const blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
    FileSaver.saveAs(blob, `${filename}.csv`);
}