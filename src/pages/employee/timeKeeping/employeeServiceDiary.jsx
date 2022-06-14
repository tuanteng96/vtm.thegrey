import React from "react";
import { Link, Navbar, Page, Sheet, Toolbar } from "framework7-react";
import NotificationIcon from "../../../components/NotificationIcon";
import PageNoData from "../../../components/PageNoData";
import ReactHtmlParser from "react-html-parser";

import {
  getPassword,
  getStockIDStorage,
  getUser,
} from "../../../constants/user";
import staffService from "../../../service/staff.service";
import "moment/locale/vi";
import moment from "moment";
moment.locale("vi");

export default class employeeServiceDiary extends React.Component {
  constructor() {
    super();
    this.state = {
      loadingSubmit: false,
      sheetOpened: false,
    };
  }

  componentDidMount() {
    this.getNotificationStaff();
  }

  getNotificationStaff = () => {
    if (!getUser()) return false;
    const infoMember = getUser();
    const user = {
      USN: infoMember.UserName,
      Pwd: getPassword(),
      StockID: getStockIDStorage(),
    };
    const cateID = this.$f7route.params.id;
    const data = {
      cmd: "noti",
      mid: cateID,
    };

    staffService
      .getNotiStaff(user, data)
      .then((response) => {
        const arrNoti = response.data;
        this.setState({
          arrNoti: arrNoti,
        });
      })
      .catch((error) => console.log(error));
  };

  openSheet = () => {
    this.setState({
      sheetOpened: true,
    });
  };

  closeSheet = () => {
    this.setState({
      sheetOpened: false,
    });
  };

  handleNote = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
    console.log(value);
  };

  orderSubmit = () => {
    
    var isPublics = false;
    const cateID = this.$f7route.params.id;
    const { Note, isPublic } = this.state;
    this.setState({
      loadingSubmit: true,
    });
    if (!getUser()) return false;
    const infoMember = getUser();
    const user = {
      USN: infoMember.UserName,
      Pwd: getPassword(),
      StockID: getStockIDStorage(),
    };

    if (!Note) {
      this.NoteTXT.focus();
      return false;
    }
    if (isPublic) {
      isPublics = 1;
    }
    const data = {
      cmd: "service_note",
      mid: cateID,
      note: Note,
      public: isPublics,
    };
    staffService
      .addNotiStaff(user, data)
      .then((response) => {
        const asyncCall = async () => {
          const getImage = await this.getNotificationStaff();
          await new Promise((resolve) => setTimeout(resolve, 1000));
          this.setState({
            loadingSubmit: false,
            sheetOpened: false,
            Note: "",
            isPublic: false,
          });
        };
        asyncCall();
      })
      .catch((error) => console.log(error));
  };

  async loadRefresh(done) {
    await this.getNotificationStaff();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    done();
  }

  render() {
    const { arrNoti, loadingSubmit, sheetOpened, Note, isPublic } = this.state;
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
                Nhật ký {arrNoti && arrNoti.length > 0 && `(${arrNoti.length})`}
              </span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>
        <div className="employee-diary">
          {arrNoti && arrNoti.length > 0 ? (
            <ul>
              {arrNoti.map((item, index) => (
                <li key={index} className={item.IsPublic > 0 ? "public" : ""}>
                  <div className="content">{ReactHtmlParser(item.Content)}</div>
                  <div className="time">
                    {moment(item.CreateDate).fromNow()}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <PageNoData text="Không có nhật ký." />
          )}
        </div>

        <Sheet
          className="sheet-swipe-product sheet-swipe-employee"
          style={{ height: "auto", "--f7-sheet-bg-color": "#fff" }}
          opened={sheetOpened}
          onSheetClosed={() => this.closeSheet()}
          swipeToClose
          swipeToStep
          backdrop
        >
          <div className="sheet-modal-swipe-step">
            <div className="sheet-modal-swipe__close"></div>
            <div className="sheet-swipe-product__content">
              <div className="sheet-pay-body">
                <div className="sheet-pay-body__form">
                  <div className="item">
                    <label>Ghi chú</label>
                    <textarea
                      name="Note"
                      placeholder="Nhập nhật ký cần lưu ..."
                      onChange={this.handleNote}
                      value={Note || ""}
                      ref={(text) => {
                        this.NoteTXT = text;
                      }}
                    ></textarea>
                  </div>
                  <div className="item">
                    <div className="item-checkbox">
                      <input
                        id="view"
                        type="checkbox"
                        name="isPublic"
                        onChange={this.handleNote}
                        checked={isPublic || false}
                      />
                      <label htmlFor="view">
                        <span>Khách hàng xem</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="sheet-pay-body__btn">
                  <button
                    className={`page-btn-order btn-submit-order ${
                      loadingSubmit && "loading"
                    }`}
                    onClick={() => this.orderSubmit()}
                  >
                    <span>Thêm mới nhật ký</span>
                    <div className="loading-icon">
                      <div className="loading-icon__item item-1"></div>
                      <div className="loading-icon__item item-2"></div>
                      <div className="loading-icon__item item-3"></div>
                      <div className="loading-icon__item item-4"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Sheet>
        <Toolbar tabbar position="bottom">
          <div className="page-toolbar">
            <div className="page-toolbar__order">
              <button
                className={`page-btn-order btn-submit-order`}
                onClick={() => this.openSheet()}
              >
                <span>Thêm mới</span>
              </button>
            </div>
          </div>
        </Toolbar>
      </Page>
    );
  }
}
