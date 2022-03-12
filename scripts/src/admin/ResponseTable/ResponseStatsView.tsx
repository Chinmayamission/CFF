import React, { useEffect } from "react";
import { connect } from "react-redux";
import { IDataOptionView, IStatsOption } from "../FormEdit/FormEdit.d";
import Loading from "../../common/Loading/Loading";
import { ResponsesState } from "../../store/responses/types";
import { fetchStats } from "../../store/responses/actions";
import ReactTable from "react-table";
import { sumBy } from "lodash";
import "./ResponseStatsView.scss";
interface IWrapperProps {
  dataOptionView: IDataOptionView;
  formId: string;
  fetchStats: (e) => any;
  stats?: IStatsOption[];
}

interface IProps {
  stats: IStatsOption[];
}

interface IStatProps {
  stat: IStatsOption;
}

const StatSingle = (props: IStatProps) => (
  <>
    <h5>{props.stat.title}</h5>
    <span className="badge badge-primary badge-pill">
      {props.stat.computedQueryValue}
    </span>
  </>
);

const StatGroup = (props: IStatProps) => {
  const totalRow = {
    _id: "Total",
    n: sumBy(props.stat.computedQueryValue as any, (e: any) => e.n)
  };
  const data = [...(props.stat.computedQueryValue as any[]), totalRow];
  const showPagination = data.length > 20;
  return (
    <>
      <h5>{props.stat.title}</h5>
      <ReactTable
        columns={[
          { Header: "Name", accessor: "_id" },
          { Header: "Value", accessor: "n" }
        ]}
        data={data}
        minRows={showPagination ? 20 : 0} // so it doesn't change size when paginating to a page with less rows
        showPagination={showPagination}
      />
    </>
  );
};

export const ResponseStatsView = (props: IProps) => (
  <div className="ccmt-cff-response-stats-view card-columns">
    {props.stats.map(stat => (
      <div className="card">
        {stat.type === "single" && <StatSingle stat={stat} />}
        {stat.type === "group" && <StatGroup stat={stat} />}
      </div>
    ))}
  </div>
);

const ResponseStatsViewWrapper = (props: IWrapperProps) => {
  useEffect(() => {
    // TODO: cache stats.
    props.fetchStats({
      formId: props.formId,
      dataOptionViewId: props.dataOptionView.id
    });
  }, []);
  if (!props.stats) {
    return <Loading />;
  }
  return <ResponseStatsView stats={props.stats} />;
};

const mapStateToProps = state => ({
  stats: (state.responses as ResponsesState).stats
});

const mapDispatchToProps = dispatch => ({
  fetchStats: e => dispatch(fetchStats(e))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResponseStatsViewWrapper);
