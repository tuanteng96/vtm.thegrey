import React from "react";
import Nodata from "../assets/images/nodata.png";
import Skeleton from 'react-loading-skeleton';


export default class PageNoData extends React.Component {
    render() {
        const data = this.props;
        return (
            <div className="page-nodata">
                <div className="page-nodata__img">
                    <img src={Nodata || <Skeleton height={314} />} alt="Chưa có dữ liệu"/>
                </div>
                <div className="page-nodata__text">
                    {data.text}
                </div>
            </div>
        )
    }
}