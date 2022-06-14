import React from "react";
import { Link, Tabs, Tab, Row, Col } from "framework7-react";
import UserService from "../../service/user.service";
import IconLocation from "../../assets/images/location1.svg";
import SkeletonStock from "./SkeletonStock";
import Carousel from "nuka-carousel";
import DatePicker from "react-mobile-datepicker";
import _ from "lodash";
import moment from "moment";
import "moment/locale/vi";
moment.locale("vi");

export default class ScheduleSpa extends React.Component {
  constructor() {
    super();
    this.state = {
      arrListDate: [], // Hiển thị 3 ngày từ ngày today next
      arrStock: [], // List Stock
      timeSelected: "",
      itemBook: {},
      isLoadingStock: true,
      isActive: 0,
      isOpen: false,
      indexCurrent: 7,
    };
  }

  componentDidMount() {
    this.listDate();
    this.getStock();
    this.setState({
      width: window.innerWidth,
    });
  }

  group = (items, n) =>
    items.reduce((acc, x, i) => {
      const idx = Math.floor(i / n);
      acc[idx] = [...(acc[idx] || []), x];
      return acc;
    }, []);

  getStock = () => {
    UserService.getStock().then((response) => {
      const ListStock = response.data.data.all;
      const arrStock = [];

      ListStock.map((item) => {
        if (item.ID !== 778) {
          arrStock.push(item);
        }
      });

      this.setState({
        arrStock: arrStock,
        isLoadingStock: false,
      });
    });
  };

  listDate = () => {
    const gettoday = moment();
    const arrListDate = [];
    const arrListTime = [];
    let slideActive = -1;
    var min = -1;
    var now = new Date().getTime();
    for (let day = 0; day <= 815; day += 15) {
      var time = moment("2020-11-05T07:30:00").add(day, "m").format("LT");
      var timeFull = moment("2020-11-05T07:30:00").add(day, "m").format("LTS");

      var d = new Date();
      d.setHours(7);
      d.setMinutes(30);
      d.setSeconds(0);

      d.setMinutes(d.getMinutes() + day);

      var tick = Math.abs(now - d.getTime());
      min = min == -1 ? tick : min > tick ? tick : min;

      var item = {
        time: time,
        fullTime: timeFull,
        tick: tick,
      };
      arrListTime.push(item);
    }
    arrListTime.forEach(function (x, index) {
      if (x.tick === min) {
        x.active = true;
        slideActive = Math.floor(index / 4);
      }
    });

    for (let day = 0; day <= 2; day++) {
      switch (day) {
        case 0:
          var todayFormat = moment(gettoday).add(day, "days").format("DD/MM");
          var today = moment(gettoday).add(day, "days").format("DD/MM/YYYY");
          var item = {
            dateFormat: "Hôm nay " + todayFormat,
            date: today,
            name: "today",
            arrtime: arrListTime,
          };
          arrListDate.push(item);
          break;
        case 1:
          var tomorrowFormat = moment(gettoday)
            .add(day, "days")
            .format("DD/MM");
          var tomorrow = moment(gettoday).add(day, "days").format("DD/MM/YYYY");
          var item = {
            dateFormat: "Ngày mai " + tomorrowFormat,
            date: tomorrow,
            name: "tomorrow",
            arrtime: arrListTime,
          };
          arrListDate.push(item);
          break;
        case 2:
          var item = {
            dateFormat: "Ngày khác",
            date: null,
            name: "other",
            arrtime: arrListTime,
          };
          arrListDate.push(item);
          break;

        default:
          var tomorrowAfterFormat = moment(gettoday)
            .add(day, "days")
            .format("DD/MM");
          var tomorrowAfter = moment(gettoday)
            .add(day, "days")
            .format("DD/MM/YYYY");
          var item = {
            dateFormat: "Ngày kia " + tomorrowAfterFormat,
            date: tomorrowAfter,
            name: "tomorrowAfter",
            arrtime: arrListTime,
          };
          arrListDate.push(item);
          break;
      }
    }

    this.setState({
      arrListDate: arrListDate,
      indexCurrent: slideActive,
    });
  };

  formatTime = (time) => {
    return time.replace(":", "h");
  };

  checkTime = (date, time) => {
    if (!date) return false;
    const dateOne = date.split("/");
    const timeOne = time.split(":");
    //dateOne[0] Date
    //dateOne[1] Month
    //dateOne[2] Year
    //timeOne[0] Hour
    //timeOne[1] Min

    const dateTwo = moment(new Date()).format("L").split("/");
    const timeTwo = moment(new Date()).format("LTS").split(":");
    var dateFullOne = new Date(
      dateOne[2],
      dateOne[1],
      dateOne[0],
      timeOne[0],
      timeOne[1],
      timeOne[2]
    );
    var dateFullTwo = new Date(
      dateTwo[2],
      dateTwo[1],
      dateTwo[0],
      timeTwo[0],
      timeTwo[1],
      timeTwo[2]
    );
    if (dateFullOne < dateFullTwo) {
      return " not-time";
    } else {
      return "";
    }
  };

  handStyle = () => {
    const _width = this.state.width / 4 - 12;
    return Object.assign({
      width: _width,
    });
  };

  onDateChanged = (date) => {
    this.props.handleTime({
      ...this.props.DateTimeBook,
      date,
      time: "",
      isOther: !date ? true : false,
    });

    this.setState({
      isOpen: !date ? true : false,
    });
  };

  handleStock = (item) => {
    this.props.handleTime({
      ...this.props.DateTimeBook,
      stock: item.ID,
      nameStock: item.Title,
    });
  };

  handleTime = (time) => {
    this.props.handleTime({
      ...this.props.DateTimeBook,
      time: time,
    });
  };

  handleShowDate = () => {
    this.setState({
      isOpen: true,
    });
    this.props.handleTime({
      ...this.props.DateTimeBook,
      isOther: true,
      date: "",
      time: "",
    });
  };

  handleSelectDate = (datetime) => {
    const date = moment(datetime).format("DD/MM/YYYY");
    this.props.handleTime({
      ...this.props.DateTimeBook,
      date,
    });
    this.setState({
      isOpen: false,
    });
  };

  handleCancelDate = () => {
    this.setState({
      isOpen: false,
    });
  };

  render() {
    const {
      arrListDate,
      arrStock,
      isLoadingStock,
      isOpen,
      otherBook,
      indexCurrent,
    } = this.state;
    const { DateTimeBook } = this.props;
    const settingsIndex = {
      //wrapAround: true,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 4,
      slideIndex: indexCurrent,
      cellSpacing: 10,
      renderBottomCenterControls: () => false,
      renderCenterLeftControls: null,
      renderCenterRightControls: null,
      afterChange: (current) => { },
      beforeChange: (current, next) => { },
    };
    const settings = {
      //wrapAround: true,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 4,
      cellSpacing: 10,
      renderBottomCenterControls: () => false,
      renderCenterLeftControls: null,
      renderCenterRightControls: null,
      afterChange: (current) => { },
      beforeChange: (current, next) => { },
    };

    const dateConfig = {
      // hour: {
      //   format: "hh",
      //   caption: "Giờ",
      //   step: 1,
      // },
      // minute: {
      //   format: "mm",
      //   caption: "Phút",
      //   step: 1,
      // },
      date: {
        caption: "Ngày",
        format: "D",
        step: 1,
      },
      month: {
        caption: "Tháng",
        format: "M",
        step: 1,
      },
      year: {
        caption: "Năm",
        format: "YYYY",
        step: 1,
      },
    };
    return (
      <div className="page-schedule__box">
        <div className="pt-8px"></div>
        <div className="page-schedule__location">
          <h5>1. Chọn spa gần bạn</h5>
          <div className="page-schedule__location-list">
            <Row>
              {isLoadingStock && <SkeletonStock />}
              {!isLoadingStock &&
                arrStock &&
                arrStock.map((item, index) => (
                  <Col width={arrStock.length > 1 ? "50" : "100"} key={index}>
                    <div className="location">
                      <div
                        className="location-item"
                        onClick={() => this.handleStock(item)}
                      >
                        <input
                          id={"location-" + item.ID}
                          type="radio"
                          name="checklocation"
                          value={item.ID}
                          checked={
                            parseInt(
                              DateTimeBook.stock && DateTimeBook.stock
                            ) === item.ID
                          }
                        />
                        <label htmlFor={"location-" + item.ID}>
                          {item.Title}
                        </label>
                        <div className="icon">
                          <img src={IconLocation} alt="Location" />
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
            </Row>
          </div>
        </div>
        <div className="page-schedule__time">
          <h5>2. Chọn thời gian</h5>
          <div className="page-schedule__date">
            <Row>
              {arrListDate &&
                arrListDate.map((item, index) => {
                  return (
                    <Col width="33" key={index}>
                      <div
                        onClick={() => this.onDateChanged(item.date)}
                        className="date-day"
                      >
                        <span
                          className={
                            !DateTimeBook.isOther
                              ? DateTimeBook.date === item.date
                                ? "active"
                                : ""
                              : item.name === "other"
                              ? "active"
                              : ""
                          }
                        >
                          {item.name !== "other"
                            ? item.dateFormat
                            : DateTimeBook.date && DateTimeBook.isOther
                            ? DateTimeBook.date
                            : item.dateFormat}
                        </span>
                      </div>
                    </Col>
                  );
                })}
              {/* <Col width="33">
                <div
                  className="date-day"
                  onClick={() => this.handleShowDate()}
                >
                  <span className={DateTimeBook.isOther ? "active" : ""}>
                    {DateTimeBook.isOther && DateTimeBook.date
                      ? DateTimeBook.date
                      : "Ngày khác"}
                  </span>
                </div>
              </Col> */}
              <DatePicker
                theme="ios"
                cancelText="Đóng"
                confirmText="Chọn"
                headerFormat="Ngày DD/MM/YYYY"
                showCaption={true}
                dateConfig={dateConfig}
                value={
                  DateTimeBook.date ? new Date(DateTimeBook.date) : new Date()
                }
                isOpen={isOpen}
                onSelect={this.handleSelectDate}
                onCancel={this.handleCancelDate}
                min={new Date()}
              />
            </Row>
          </div>
          <div className="page-schedule__note">
            <div className="page-schedule__note-item">
              <div className="box box-not"></div>
              <span>Hết chỗ</span>
            </div>
            <div className="page-schedule__note-item">
              <div className="box box-no"></div>
              <span>Còn chỗ</span>
            </div>
            <div className="page-schedule__note-item">
              <div className="box box-succes"></div>
              <span>Đang chọn</span>
            </div>
          </div>
          <Tabs>
            {arrListDate &&
              arrListDate.map((item, index) => (
                <Tab
                  key={index}
                  id={"tab-" + item.name}
                  className="page-tab-location"
                  tabActive={
                    !DateTimeBook.isOther
                      ? DateTimeBook.date === item.date
                      : item.name === "other"
                  }
                >
                  <div className="page-schedule__time-list">
                    <Carousel
                      {...(index === 0 ? settingsIndex : settings)}
                      className={index === 0 ? "slide-time-first" : ""}
                    >
                      {this.group(item.arrtime, 4).map((children, k) => (
                        <div
                          className="group-time"
                          //style={this.handStyle()}
                          key={k}
                        >
                          {children.map((sub, i) => (
                            <div
                              className={`group-time__item ${item.name === "today" && this.checkTime(
                                item.date,
                                sub.fullTime
                              )}`}
                              key={i}
                              onClick={() => this.handleTime(sub.time)}
                            >
                              <label
                                className={
                                  DateTimeBook.time === sub.time ? "active" : ""
                                }
                              >
                                {this.formatTime(sub.time)}
                              </label>
                            </div>
                          ))}
                        </div>
                      ))}
                    </Carousel>
                  </div>
                </Tab>
              ))}
          </Tabs>
        </div>
      </div>
    );
  }
}
