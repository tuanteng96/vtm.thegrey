import React from "react";
import {
  Actions,
  ActionsButton,
  ActionsGroup,
  ActionsLabel,
  Button,
  Link,
  ListInput,
  Navbar,
  Page,
  Sheet,
  Toolbar,
} from "framework7-react";
import NotificationIcon from "../../../components/NotificationIcon";
import ToolBarBottom from "../../../components/ToolBarBottom";
import {
  getPassword,
  getStockIDStorage,
  getUser,
} from "../../../constants/user";
import staffService from "../../../service/staff.service";
import moment from "moment";
import "moment/locale/vi";
import PageNoData from "../../../components/PageNoData";
import SkeletonService from "./skeleton/SkeletonService";
moment.locale("vi");
export default class employeeService extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      loadingSubmit: false,
      sheetOpened: false,
      messageForce: false,
      showPreloader: false,
      keyword: "",
      startDate: "",
      endDate: "",
      arrDefaultDate: [],
    };
  }

  componentDidMount() {
    const formData = {
      cmd: "member_sevice",
      IsManager: 1,
      IsService: 1,
      MemberIDs: "",
      srv_status: "book,wait_book,wait,doing,done,cancel",
      srv_from: moment().format("l"),
      srv_to: moment().format("l"),
      key: "",
      ps: 1000,
    };
    this.getService(formData);
  }

  getService = (data) => {
    if (!getUser()) return false;
    const infoMember = getUser();
    const user = {
      USN: infoMember.UserName,
      PWD: getPassword(),
      StockID: getStockIDStorage(),
    };

    staffService
      .getServiceStaff(user, data)
      .then((response) => {
        const result = response.data.data;
        setTimeout(() => {
          this.setState({
            arrService: result,
            isLoading: false,
          });
        }, 200);
      })
      .catch((err) => console.log(err));
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

  handleDetail = (item) => {
    this.$f7router.navigate("/employee/service/" + item.ID + "/");
  };
  handleDiary = (item) => {
    this.$f7router.navigate("/employee/diary/" + item.MemberID + "/");
  };
  handleSchedule = (item) => {
    this.$f7router.navigate("/employee/schedule/" + item.OrderItemID + "/");
  };

  handleClickSv = (item) => {
    this.refs.actionService.open();
  };

  onChangeTextS = (evt) => {
    this.setState({
      keyword: evt.target.value,
    });
  };
  clearInput = () => {
    this.setState({
      keyword: "",
    });
  };
  onChangeDateS = (evt) => {
    const start = evt[0];
    const end = evt[1] ? evt[1] : evt[0];
    this.setState({
      startDate: moment(start).format("DD/MM/YYYY"),
      endDate: moment(end).format("DD/MM/YYYY"),
      arrDefaultDate: evt,
    });
  };

  onInputFocus = () => {
    this.setState({
      messageForce: false,
    });
  };

  openFilter = () => {
    this.setState({
      sheetOpened: true,
    });
  };

  closeSheet = () => {
    this.setState({
      sheetOpened: false,
    });
  };

  searchSubmit = async () => {
    const { startDate, endDate, keyword } = this.state;
    this.setState({
      loadingSubmit: true,
      isLoading: true,
    });
    const formData = {
      cmd: "member_sevice",
      IsManager: 1,
      IsService: 1,
      MemberIDs: "",
      srv_status: "book,wait_book,wait,doing,done,cancel",
      srv_from: startDate ? startDate : moment().format("l"),
      srv_to: endDate ? endDate : moment().format("l"),
      key: keyword,
      ps: 1000,
    };
    const result = await this.getService(formData);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.setState({
      loadingSubmit: false,
      sheetOpened: false,
      isLoading: false,
    });
  };

  async loadRefresh(done) {
    const { startDate, endDate, keyword } = this.state;
    const formData = {
      cmd: "member_sevice",
      IsManager: 1,
      IsService: 1,
      MemberIDs: "",
      srv_status: "book,wait_book,wait,doing,done,cancel",
      srv_from: startDate || moment().format("l"),
      srv_to: endDate || moment().format("l"),
      key: keyword || "",
      ps: 1000,
    };

    await this.getService(formData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    done();
  }

  render() {
    const {
      arrService,
      isLoading,
      loadingSubmit,
      sheetOpened,
      messageForce,
      arrDefaultDate,
    } = this.state;
    return (
      <Page
        name="employee-service"
        onPtrRefresh={this.loadRefresh.bind(this)}
        ptr
        infiniteDistance={50}
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.openFilter()}>
                <i className="las la-filter"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">
                Dịch Vụ{" "}
                {arrService &&
                  arrService.length > 0 &&
                  `(${arrService.length})`}
              </span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>
        <div className="page-render employee-service p-0">
          <div className="employee-service__list">
            {isLoading && <SkeletonService />}
            {!isLoading && arrService && (
              <>
                {arrService.length > 0 ? (
                  arrService.map((item, index) => (
                    <div key={index}>
                      <div className="item">
                        <h3>
                          {this.checkStatus(item.Status)}
                          {item.Title}
                        </h3>
                        <ul>
                          <li>
                            <span>Khách hàng : </span>
                            <span>{item.member.FullName}</span>
                          </li>
                          <li>
                            <span>Ngày đặt lịch : </span>
                            <span>{moment(item.BookDate).format("L")}</span>
                          </li>
                          <li>
                            <span>Giờ đặt lịch : </span>
                            <span>{moment(item.BookDate).format("LT")}</span>
                          </li>
                          <li>
                            <span>Số phút : </span>
                            <span>{item.Minutes}p/Ca</span>
                          </li>
                        </ul>
                        <Button
                          noClassName
                          raised={true}
                          actionsOpen={`#actions-group-${item.ID}`}
                        ></Button>
                      </div>
                      <Actions
                        className="actions-custom"
                        id={`actions-group-${item.ID}`}
                      >
                        <ActionsGroup>
                          <ActionsLabel>{item.Title}</ActionsLabel>
                          <ActionsButton
                            onClick={() => this.handleDetail(item)}
                          >
                            Xem chi tiết
                          </ActionsButton>
                          <ActionsButton onClick={() => this.handleDiary(item)}>
                            Nhật ký
                          </ActionsButton>
                          <ActionsButton
                            onClick={() => this.handleSchedule(item)}
                          >
                            Lịch trình
                          </ActionsButton>
                        </ActionsGroup>
                        <ActionsGroup>
                          <ActionsButton color="red">Đóng</ActionsButton>
                        </ActionsGroup>
                      </Actions>
                    </div>
                  ))
                ) : (
                  <PageNoData text="Bạn không có lịch dịch vụ !" />
                )}
              </>
            )}
          </div>
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
                  <ul>
                    <ListInput
                      label="Tên dịch vụ"
                      type="text"
                      placeholder="Tìm theo tên dịch vụ"
                      clearButton
                      onChange={this.onChangeTextS}
                      onFocus={this.onInputFocus}
                      onInputClear={this.clearInput}
                      errorMessage="Vui lòng nhập từ khóa hoặc chọn ngày cần tìm kiếm."
                      errorMessageForce={messageForce}
                    />
                    <ListInput
                      label="Chọn ngày"
                      type="datepicker"
                      placeholder="Ngày bắt đầu - Ngày kết thúc"
                      value={arrDefaultDate}
                      readonly
                      calendarParams={{
                        dateFormat: "dd/mm/yyyy",
                        rangePicker: true,
                        footer: true,
                        toolbarCloseText: "Xác nhận",
                        backdrop: true,
                      }}
                      clearButton
                      onCalendarChange={this.onChangeDateS}
                    />
                  </ul>
                </div>
                <div className="sheet-pay-body__btn">
                  <button
                    className={`page-btn-order btn-submit-order ${
                      loadingSubmit && "loading"
                    }`}
                    onClick={() => this.searchSubmit()}
                  >
                    <span>Tìm dịch vụ</span>
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
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
