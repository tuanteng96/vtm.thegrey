import React from "react";
import { Page, Link, Navbar, f7 } from "framework7-react";
import SelectStock from "../../components/SelectStock";
import {
  checkAvt,
  formatDateBirday,
  formatDateUTC,
} from "../../constants/format";
import {
  getUser,
  getPassword,
  getStockNameStorage,
  app_request,
} from "../../constants/user";
import UserService from "../../service/user.service";
import DatePicker from "react-mobile-datepicker";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NAME_APP, VERSION_APP } from "../../constants/config";
import { SEND_TOKEN_FIREBASE } from "../../constants/prom21";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      memberInfo: {},
      IDStockName: "",
      isOpen: false,
      isOpenStock: false,
      showPreloader: false,
    };
  }

  componentDidMount() {
    this.getInfoMember();
    this.getStockCurrent();
  }
  getInfoMember = () => {
    const infoUser = getUser();
    if (!infoUser) return false;
    const username = infoUser.MobilePhone
      ? infoUser.MobilePhone
      : infoUser.UserName;
    const password = getPassword();
    UserService.getInfo(username, password)
      .then((response) => {
        if (response.error) {
          this.$f7router.navigate("/login/");
        } else {
          const memberInfo = response.data;
          this.setState({
            memberInfo: memberInfo,
          });
        }
      })
      .catch((err) => console.log(err));
  };
  
  signOut = () => {
    const $$this = this;
    $$this.$f7.dialog.confirm(
      "Bạn muốn đăng xuất khỏi tài khoản ?",
      async () => {
        try {
          f7.dialog.preloader(`Đăng xuất ...`);
          SEND_TOKEN_FIREBASE().then(async (response) => {
            if (!response.error && response.Token) {
              const { ID, acc_type } = getUser();
              await UserService.authRemoveFirebase({
                Token: response.Token,
                ID: ID,
                Type: acc_type,
              });
            } else {
              app_request("unsubscribe", "");
            }
            await localStorage.clear();
            await new Promise((resolve) => setTimeout(resolve, 800));
            f7.dialog.close();
            $$this.$f7router.navigate("/", {
              reloadCurrent: true,
            });
          });
        } catch (error) {
          console.log(error);
        }
      }
    );
  };

  handleClickBirthday = () => {
    this.setState({ isOpen: true });
  };

  handleCancelBirthday = () => {
    this.setState({ isOpen: false });
  };

  handleSelectBirthday = (date) => {
    var date = formatDateUTC(date);
    const infoUser = getUser();
    const username = infoUser?.MobilePhone;
    const password = getPassword();

    UserService.updateBirthday(date, username, password)
      .then((response) => {
        if (!response.error) {
          toast.success("Cập nhập ngày sinh thành công !", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 1000,
          });
          this.getInfoMember();
        } else {
          toast.error("Ngày sinh không hợp lệ !", {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 1000,
          });
        }
      })
      .catch((err) => console.log(err));
    this.setState({ isOpen: false });
  };

  handleUpdateEmail = () => {
    const self = this;
    self.$f7router.navigate("/edit-email/");
  };
  handleUpdatePassword = () => {
    const self = this;
    self.$f7router.navigate("/edit-password/");
  };

  getStockCurrent = () => {
    const StockCurrentName = getStockNameStorage();
    this.setState({
      IDStockName: StockCurrentName,
    });
  };

  changeStock = () => {
    this.setState({ isOpenStock: !this.state.isOpenStock });
  };

  checkSuccess = (status) => {
    if (status === true) {
      this.getStockCurrent();
    }
  };

  checkMember = (memberInfo) => {
    if (!memberInfo) return false;
    if (memberInfo.acc_type === "M") {
      return memberInfo.acc_group > 0
        ? memberInfo.MemberGroups[0].Title
        : "Thành viên";
    }
    if (memberInfo.ID === 1) {
      return "ADMIN";
    }
    if (memberInfo.acc_type === "U" && memberInfo.GroupTitles.length > 0) {
      return memberInfo.GroupTitles.join(", ");
    }
  };

  loadRefresh(done) {
    setTimeout(() => {
      this.getInfoMember();
      this.getStockCurrent();
      this.setState({
        showPreloader: true,
      });
      done();
    }, 600);
  }

  render() {
    
    const { memberInfo } = this.state;
    const IDStockName = this.state.IDStockName;
    const dateConfig = {
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
      <Page
        onPageBeforeIn={this.onPageBeforeIn.bind(this)}
        name="detail-profile"
        noToolbar
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
              <span className="title">Thông tin cá nhân</span>
            </div>
            <div className="page-navbar__noti">
              <Link onClick={() => this.signOut()}>
                <i className="las la-sign-out-alt"></i>
              </Link>
            </div>
          </div>
        </Navbar>
        <div className="page-render page-detail-profile p-0">
          <div className="page-detail-profile__box">
            <div className="page-detail-profile__item">
              <div className="name">Avatar</div>
              <div className="content">
                <div className="content-avatar">
                  <img src={checkAvt(memberInfo?.Photo || memberInfo?.Avatar)} />
                </div>
              </div>
            </div>
            <div className="page-detail-profile__item">
              <div className="name">Họ và tên</div>
              <div className="content">
                <div className="content-text">
                  {memberInfo && memberInfo.FullName}
                </div>
              </div>
            </div>
            <div className="page-detail-profile__item">
              <div className="name">Giới tính</div>
              <div className="content">
                <div className="content-text">
                  {memberInfo && memberInfo.Gender === 1 ? "Nam" : "Nữ"}
                </div>
              </div>
            </div>
            <div
              className="page-detail-profile__item"
              onClick={this.handleClickBirthday}
            >
              <div className="name">Ngày sinh</div>
              <div className="content">
                <div className="content-text">
                  {memberInfo && memberInfo.BirthDate
                    ? formatDateBirday(memberInfo.BirthDate)
                    : "Chưa cập nhập"}
                  <DatePicker
                    theme="ios"
                    cancelText="Đóng"
                    confirmText="Cập nhập"
                    headerFormat="DD/MM/YYYY"
                    showCaption={true}
                    dateConfig={dateConfig}
                    value={
                      memberInfo && memberInfo.BirthDate
                        ? new Date(memberInfo.BirthDate)
                        : new Date()
                    }
                    isOpen={this.state.isOpen}
                    onSelect={this.handleSelectBirthday}
                    onCancel={this.handleCancelBirthday}
                  />
                </div>
                <i className="las la-angle-right"></i>
              </div>
            </div>
            <div className="page-detail-profile__item">
              <div className="name">Số điện thoại</div>
              <div className="content">
                <div className="content-text">
                  {memberInfo && memberInfo.MobilePhone
                    ? memberInfo.MobilePhone || "Chưa cập nhập"
                    : memberInfo.Phone || "Chưa cập nhập"}
                </div>
              </div>
            </div>
            <div
              className="page-detail-profile__item"
              onClick={() => this.handleUpdateEmail()}
            >
              <div className="name">Email</div>
              <div className="content">
                <div className="content-text">
                  {memberInfo && memberInfo.Email
                    ? memberInfo.Email
                    : "Chưa cập nhập"}
                </div>
                <i className="las la-angle-right"></i>
              </div>
            </div>
            <div className="page-detail-profile__item">
              <div className="name">Địa chỉ</div>
              <div className="content">
                <div className="content-text">
                  {memberInfo && memberInfo.HomeAddress
                    ? memberInfo.HomeAddress
                    : "Chưa cập nhập"}
                </div>
              </div>
            </div>
            <div
              className="page-detail-profile__item"
              onClick={() => this.changeStock()}
            >
              <div className="name">Cơ sở</div>
              <div className="content">
                <div className="content-text">
                  {IDStockName === "" ? "Chưa chọn điểm" : IDStockName}
                </div>
                <i className="las la-angle-right"></i>
              </div>
            </div>
            <div className="page-detail-profile__item">
              <div className="name">Nhóm</div>
              <div className="content">
                <div className="content-text">
                  {this.checkMember(memberInfo && memberInfo)}
                </div>
              </div>
            </div>
            <div
              className="page-detail-profile__item"
              onClick={() => this.handleUpdatePassword()}
            >
              <div className="name">Mật khẩu</div>
              <div className="content">
                <div className="content-text password-chw">Thay đổi</div>
                <i className="las la-angle-right"></i>
              </div>
            </div>
            <div className="line-logout"></div>
          </div>
          <div className="page-detail-profile__footer">
            <div className="text">{`${NAME_APP} ${VERSION_APP}`}</div>
            <button
              type="button"
              className="btn-signout"
              onClick={() => this.signOut()}
            >
              Đăng xuất
            </button>
          </div>
        </div>
        <SelectStock
          isOpenStock={this.state.isOpenStock}
          fnSuccess={(status) => this.checkSuccess(status)}
        />
      </Page>
    );
  }
  onPageBeforeIn() {
    this.getInfoMember();
  }
}
