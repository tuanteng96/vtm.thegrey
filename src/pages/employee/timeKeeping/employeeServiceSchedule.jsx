import React from "react";
import { Link, Navbar, Page, Sheet, Toolbar } from "framework7-react";
import NotificationIcon from "../../../components/NotificationIcon";
import PageNoData from "../../../components/PageNoData";
import ToolBarBottom from "../../../components/ToolBarBottom";
import {
  getPassword,
  getStockIDStorage,
  getUser,
} from "../../../constants/user";
import staffService from "../../../service/staff.service";
import "moment/locale/vi";
import moment from "moment";
moment.locale("vi");

export default class employeeServiceSchedule extends React.Component {
  constructor() {
    super();
    this.state = {
      loadingSubmit: false,
      sheetOpened: false,
    };
  }

  componentDidMount() {
    this.getScheduleStaff();
  }

  getScheduleStaff = () => {
    if (!getUser()) return false;
    const infoMember = getUser();
    const user = {
      USN: infoMember.UserName,
      Pwd: getPassword(),
      StockID: getStockIDStorage(),
    };
    const OrderItemID = this.$f7route.params.orderItem;
    const data = {
      cmd: "booklist",
      OrderItemID: OrderItemID,
    };

    staffService
      .getBookStaff(user, data)
      .then((response) => {
        const arrBook = response.data;
        this.setState({
          arrBook: arrBook,
        });
      })
      .catch((error) => console.log(error));
  };

  checkStatus = (status) => {
    switch (status) {
      case "done":
        return (
          <span className="label-inline label-light-success">Hoàn thành</span>
        );
      case "doing":
        return (
          <span className="label-inline label-light-warning">
            Đang thực hiện
          </span>
        );
      default:
        return (
          <span className="label-inline label-light-info">Chưa thực hiện</span>
        );
    }
  };

  async loadRefresh(done) {
    await this.getScheduleStaff();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.setState({
      showPreloader: true,
    });
    done();
  }

  render() {
    const { arrBook } = this.state;
    return (
      <Page
        name="employee-diary"
        onPtrRefresh={this.loadRefresh.bind(this)}
        ptr
        infiniteDistance={50}
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">
                Lịch trình{" "}
                {arrBook && arrBook.length > 0 && `(${arrBook.length})`}
              </span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>
        <div className="employee-diary">
          {arrBook && arrBook.length > 0 ? (
            <ul>
              {arrBook.map((item, index) => (
                <li
                  key={index}
                  className={item.Status ? item.Status : "unfulfilled"}
                >
                  <div className="status">
                    {item.BookDate && (
                      <div className="time">
                        {moment(item.BookDate).format("LLL")}
                      </div>
                    )}
                    {this.checkStatus(item.Status)}
                  </div>
                  <div className="content">{item.Title}</div>
                </li>
              ))}
            </ul>
          ) : (
            <PageNoData text="Không có lịch trình." />
          )}
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
