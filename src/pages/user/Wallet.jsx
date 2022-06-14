import React from "react";
import {
  Page,
  Link,
  Navbar,
  Toolbar,
  Tabs,
  Tab,
  Row,
  Col,
  Subnavbar,
  Button,
  Sheet,
} from "framework7-react";
import ToolBarBottom from "../../components/ToolBarBottom";
import UserService from "../../service/user.service";
import { getUser } from "../../constants/user";
import { maxBookDate, formatPriceVietnamese } from "../../constants/format";
import moment from "moment";
import "moment/locale/vi";
import NotificationIcon from "../../components/NotificationIcon";
import WalletCardModal from "./Wallet/WalletCardModal";
import Skeleton from "react-loading-skeleton";
import PageNoData from "../../components/PageNoData";
moment.locale("vi");

const MUA_HANG = "MUA_HANG";
const HOAN_TIEN = "HOAN_TIEN";
const NAP_QUY = "NAP_QUY";
function eq(a, b) {
  if (a.Type === NAP_QUY) return false;
  if (
    a.Type === b.Type &&
    a.SourceID === b.SourceID &&
    a.RefOrderID == b.RefOrderID
  )
    return true;

  return false;
}
class MM {
  data = {
    Items: [],
    MemberMoneys: [],
    Form: {},
    Cashs: [],
    Methods: [],
    P: {
      Value: 0,
      MethodPayID: 1,
      Desc: "",
    },
    ShowTable: true,
    Grouped: [],
    remainPayed: {
      OrderIDs: [],
      OrderItemIDs: [],
    },
    //for app21
    KHONG_DATCOC: true,
    KHONG_NAPVI: true,
    ///Mode: _opt && _opt.key && _opt.key.KHONG_DATCOC === false ? 'DAT_COC' : 'NAP_VI',

    //on app
    TypeDesc: {
      MUA_HANG: "Tích lũy mua hàng",
      THANH_TOAN_DH: "Thanh toán đơn hàng",
      NAP_QUY: "Nạp tiền ví điện tử",
    },
  };

  GroupItem() {
    var t = this;
    var data = t.data;
    data.Items.forEach(function (x) {
      var _z = null;
      t.data.Grouped.every(function (z) {
        if (eq(x, z)) _z = z;
        return _z === null;
      });
      if (_z === null) {
        data.Grouped.push(x);
      } else {
        _z.Value += x.Value;
      }

      switch (x.Source) {
        case "OrderEnt":
        case "vOrderEnt":
          if (
            data.remainPayed.OrderIDs &&
            (data.remainPayed.OrderIDs.indexOf(x.SourceID) > -1 ||
              data.remainPayed.OrderIDs.indexOf(x.RefOrderID) > -1)
          )
            x.IsOrderRemainPay = true;
          break;
        case "OrderItemEnt":
        case "vOrderItemEnt":
          if (
            data.remainPayed.OrderItemIDs &&
            (data.remainPayed.OrderItemIDs.indexOf(x.SourceID) > -1 ||
              data.remainPayed.OrderIDs.indexOf(x.RefOrderID) > -1)
          )
            x.IsOrderRemainPay = true;
          break;
      }
    });
  }
  sumAvai(NAP_VI, NoOrderRemainPay) {
    var tt = 0;
    var data = this.data;
    data.Grouped.forEach(function (x) {
      var v = 0;
      if (NAP_VI && x.Desc.indexOf("DATCOC:") !== 0) v = x.Value;
      if (!NAP_VI && x.Desc.indexOf("DATCOC:") === 0) v = x.Value;

      if (x.IsOrderRemainPay && NoOrderRemainPay === undefined) {
        //Đơn hàng chưa thanh toán hết, các khoản tích lũy sẽ ko đc cộng dồn
        //Giá trị có thể âm trong th khấu trừ trả hàng
        v = v > 0 ? 0 : v; //2020-10/20: fixed tạm tích luuyx sẽ ko đc tính, nếu chưa thanh toán hết. các th còn lại đều đc tính
        //* có rất nhiều th cần xem xết cẩn thận
      }

      tt += v;
    });
    return tt;
  }
  totalWallet() {
    return this.data.Grouped.reduce((n, { Value }) => n + Value, 0);
  }
  availableWallet() {
    return this.data.Grouped.filter((item) => {
      return item.Type === "MUA_HANG" ||
        item.Type === "GIOI_THIEU" ||
        item.Type === "CHIA_SE_MAGIAMGIA"
        ? item.Order?.RemainPay === 0
        : item;
    }).reduce((n, { Value }) => n + Value, 0);
  }
  calc() {
    var data = this.data;
    data.Items.forEach(function (x) {
      var c = null;

      if (data.Cashs)
        data.Cashs.every(function (z) {
          if (z.SourceID === x.ID) c = z.Value;
          return c === null;
        });

      x.CashValue = c || 0;
    });
  }
  constructor(rt) {
    var t = this;
    t.data.Grouped.length = 0;
    t.data.Items = rt.data || [];
    t.data.Cashs = rt.cash || [];
    t.data.remainPayed = rt.remainPayed;
    t.calc();
    t.GroupItem();
  }
}

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      arrWallet: [],
      totalWallet: 0, // Ví
      demonsWallet: 0, // Quỷ
      depositWallet: 0, // Đặt cọc
      showPreloader: false,
      arrCardWallet: [],
      tabCurrent: "wallet",
      sheetOpened: {
        open: false,
        ID: null,
        item: null,
      },
      loading: false,
    };
  }
  componentDidMount() {
    this.getWallet();
    this.getCardWallet();
  }

  getWallet = () => {
    const infoUser = getUser();
    if (!infoUser) return false;
    const memberid = infoUser.ID;
    var bodyFormData = new FormData();
    bodyFormData.append("cmd", "list_money");
    bodyFormData.append("MemberID", memberid);
    this.setState({ loading: true });
    UserService.getWallet(bodyFormData)
      .then((response) => {
        const arrWallet = response.data.data;
        var mm = new MM(clone(response.data));
        this.setState({
          arrWallet: arrWallet,
          totalWallet: mm.totalWallet(), // Tổng Ví
          demonsWallet: mm.availableWallet(), // Ví khả dụng
          depositWallet: mm.sumAvai(false), // Đặt cọc
          //totalWallet: mm.sumAvai(true), // Ví
          //demonsWallet: mm.sumAvai(true, true), // Quỷ
          //depositWallet: mm.sumAvai(false), // Đặt cọc,
          loading: false,
        });
      })
      .catch((e) => console.log(e));
  };

  getCardWallet = () => {
    const infoUser = getUser();
    if (!infoUser) return false;
    const memberid = infoUser.ID;
    UserService.getCardWallet(memberid)
      .then(({ data }) => {
        this.setState({
          arrCardWallet: data.data,
        });
      })
      .catch((error) => console.log(error));
  };

  vietnamesText = (item) => {
    switch (true) {
      case item.Type === "NAP_QUY" && item.Source === "" && item.Value >= 0:
        return "Nạp ví";
      case item.Type === "NAP_QUY" && item.Value < 0 && item.Source === "":
        return "Trừ ví";
      case item.Source === "CHINH_SUA_SO_BUOI_DV":
        return "Hoàn tiền khi hoàn buổi dịch vụ";
      case item.Type === "MUA_HANG" &&
        item?.Desc.indexOf("KHAU_TRU_TRA_HANG") === -1:
        return "Tích lũy mua hàng";
      case item.Type === "MUA_HANG" &&
        item?.Desc.indexOf("KHAU_TRU_TRA_HANG") > -1:
        return "Giảm bớt tích lũy do trả hàng";
      case item.SumType === "TRA_HANG_HOAN_VI":
        return "Hoàn tiền khi trả hàng";
      case item.SumType === "TRA_HANG_PHI_VI":
        return "Phí dịch vụ trả hàng";
      case item.Type === "GIOI_THIEU" &&
        item?.Desc.indexOf("KHAU_TRU_TRA_HANG") === -1:
        return "Hoa hồng giới thiệu";
      case item.Type === "GIOI_THIEU" &&
        item?.Desc.indexOf("KHAU_TRU_TRA_HANG") > -1:
        return "Giảm bớt hoa hồng do trả hàng";
      case item.Type === "CHIA_SE_MAGIAMGIA":
        return "Hoa hồng giới thiệu ( Chia sẻ voucher )";
      case item.SumType === "KET_THUC_THE_HOAN_VI":
        return "Hoàn tiền khi kết thúc thẻ";
      case item.SumType === "KET_THUC_THE_PHI_VI":
        return "Phí dịch vụ kết thúc thẻ";
      case item.SumType === "DANG_KY_THANH_VIEN":
        return "Ưu đãi đăng ký tài khoản";
      case item.SumType === "DANG_NHAP_LAN_DAU":
        return "Ưu đãi khi đăng nhập lần đầu";
      case item.SumType === "CHUC_MUNG_SN":
        return "Ưu đãi mừng sinh nhật";
      case item.SumType === "CHUC_MUNG_SN_THANG":
        return "Ưu đãi tháng sinh nhật";
      case item.Type === "THANH_TOAN_DH":
        return "Thanh toán đơn hàng";
      case item.Type === "PHI" && item.SumType === "":
        return "Phí dịch vụ";
      default:
        return "Chưa xác định";
    }
  };

  onOpenSheet = (item) => {
    this.setState({
      sheetOpened: {
        open: true,
        ID: item.id,
        item,
      },
    });
  };

  hideOpenSheet = () => {
    this.setState({
      sheetOpened: {
        open: false,
        ID: null,
        item: null,
      },
    });
  };

  loadRefresh(done) {
    setTimeout(() => {
      this.setState({
        showPreloader: true,
      });
      this.getWallet();
      this.getCardWallet();
      done();
    }, 600);
  }

  render() {
    const {
      arrWallet,
      totalWallet,
      demonsWallet,
      arrCardWallet,
      tabCurrent,
      sheetOpened,
      loading,
    } = this.state;

    return (
      <Page
        //noNavbar
        name="wallet"
        className="wallet"
        ptr
        infiniteDistance={50}
        infinitePreloader={this.state.showPreloader}
        onPtrRefresh={this.loadRefresh.bind(this)}
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Ví & Thẻ tiền</span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
          <Subnavbar className="wallet-subnavbar">
            <div className="wallet-subnavbar-list">
              <Link
                noLinkClass
                tabLinkActive={tabCurrent === "wallet"}
                onClick={() => this.setState({ tabCurrent: "wallet" })}
              >
                Ví điện tử
              </Link>
              <Link
                noLinkClass
                tabLinkActive={tabCurrent === "card"}
                onClick={() => this.setState({ tabCurrent: "card" })}
              >
                Thẻ tiền
              </Link>
            </div>
          </Subnavbar>
        </Navbar>
        <Tabs className="h-100">
          <Tab
            className="h-100"
            id="wallet"
            tabActive={tabCurrent === "wallet"}
          >
            <div className="wallet-bg">
              {/* <div className="page-login__back">
            <Link onClick={() => this.$f7router.back()}>
              <i className="las la-arrow-left"></i>
            </Link>
          </div> */}
              {/* <div className="name">Ví điện tử</div> */}
              <div className="wallet-total">
                <span className="number">
                  {formatPriceVietnamese(totalWallet && totalWallet)}
                </span>
                <span className="text">Tổng Ví</span>
              </div>
            </div>
            <div className="wallet-detail">
              <div className="wallet-detail__wrap">
                <div className="wallet-detail__box">
                  <Row>
                    <Col width="50">
                      <div className="wallet-detail__box-item">
                        <span className="number">
                          {formatPriceVietnamese(demonsWallet && demonsWallet)}
                        </span>
                        <span className="text">Ví khả dụng</span>
                      </div>
                    </Col>
                    <Col width="50">
                      <div className="wallet-detail__box-item">
                        <span className="number">
                          {formatPriceVietnamese(
                            (totalWallet && totalWallet) -
                            (demonsWallet && demonsWallet)
                          )}
                        </span>
                        <span className="text">Chờ xử lý</span>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
            <div className="wallet-history">
              <h5>Lịch sử giao dịch</h5>
              <div className="wallet-history__list">
                <ul>
                  {loading &&
                    Array(5)
                      .fill()
                      .map((item, index) => (
                        <li
                          className={index % 2 === 0 ? "add" : "down"}
                          key={index}
                        >
                          <div className="price">
                            <div className="price-number">
                              {index % 2 === 0 > 0 ? "+" : ""}
                              <Skeleton width={50} />
                            </div>
                            <div className="price-time">
                              <Skeleton width={100} />
                            </div>
                          </div>
                          <div className="note">
                            <Skeleton width={150} />
                          </div>
                        </li>
                      ))}
                  {!loading &&
                    arrWallet &&
                    arrWallet.map((item, index) => (
                      <li
                        className={item.Value > 0 ? "add" : "down"}
                        key={index}
                      >
                        <div className="price">
                          <div className="price-number">
                            {item.Value > 0 ? "+" : ""}
                            {formatPriceVietnamese(item.Value)}
                          </div>
                          <div className="price-time">
                            {moment(item.CreateDate).fromNow()}
                          </div>
                        </div>
                        <div className="note">{this.vietnamesText(item)}</div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </Tab>
          <Tab className="h-100" id="card" tabActive={tabCurrent === "card"}>
            <div className="wallet-card">
              {arrCardWallet &&
                arrCardWallet.length > 0 ? arrCardWallet.map((item, index) => (
                  <div className="wallet-card-item" key={index}>
                    <div className="total">
                      <div className="total-left">
                        <span>
                          {item.ten}{" "}
                          {item.trang_thai === "Khóa" ? (
                            <span className="text-red">
                              ( {item.trang_thai} )
                            </span>
                          ) : (
                            ""
                          )}
                        </span>
                        <div className="total-num">
                          {formatPriceVietnamese(item.gia_tri_the)}
                          <span>₫</span>
                        </div>
                      </div>
                      <div className="total-right">
                        <Button
                          className="show-more"
                          onClick={() => this.onOpenSheet(item)}
                        >
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                    <div className="info">
                      <div className="info-item">
                        <div className="info-item-title">Giới hạn</div>
                        <div className="info-item-value">
                          {formatPriceVietnamese(item.gia_tri_chi_tieu)}
                          <span>₫</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-item-title">Còn lại</div>
                        <div className="info-item-value">
                          {formatPriceVietnamese(
                            item.gia_tri_chi_tieu - item.su_dung
                          )}
                          <span>₫</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-item-title">Hạn dùng</div>
                        <div
                          className={`info-item-value ${moment().diff(item.han_dung, "minutes") < 0
                            ? ""
                            : "text-red"
                            }`}
                        >
                          {!item.han_dung ? "Không giới hạn" : (<React.Fragment>
                            {item.han_dung && moment().diff(item.han_dung, "minutes") < 0
                              ? moment(item.han_dung).format("DD/MM/YYYY")
                              : "Hết hạn"}
                          </React.Fragment>)}

                        </div>
                      </div>
                    </div>
                  </div>
                )) : <PageNoData text="Chưa có thẻ tiền" />}
              <WalletCardModal
                sheetOpened={sheetOpened}
                hideOpenSheet={this.hideOpenSheet}
              />
            </div>
          </Tab>
        </Tabs>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
