import { IHeaderObject } from "../util/Headers";
import Papa from "papaparse";
import FileSaver from "file-saver";
import { isPlainObject, values } from "lodash";
import ReactDOMServer from "react-dom/server";

export default function downloadCSV(headers: IHeaderObject[], data, filename: string) {
    const csv = Papa.unparse({
        fields: headers.map(e => e.Header),
        data: data.map(response =>
            headers.map(header => {
                let value = header.accessor(response);
                let cell = header.Cell({ "value": value });
                if (isPlainObject(cell)) {
                    const html = ReactDOMServer.renderToStaticMarkup(cell);
                    const el = document.createElement( 'html' ) as HTMLElement;
                    el.innerHTML = html;
                    const selectElements = el.getElementsByTagName("select");
                    if (selectElements && selectElements.length) {
                        const select = selectElements[0] as HTMLSelectElement;
                        return select.options[select.selectedIndex].text;
                    }
                    return value.displayName || values(value).join(" ");
                }
                return cell;
            }
            )
        )
    });
    const blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
    FileSaver.saveAs(blob, `${filename}.csv`);
}