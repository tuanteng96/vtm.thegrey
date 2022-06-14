import React from "react";
import { Page, Link, Navbar } from "framework7-react";
import bgImage from "../../assets/images/headerbottombgapp.png";
import IconChangePassword from "../../assets/images/edit-password.svg";
import { getUser, getPassword } from "../../constants/user";
import UserService from "../../service/user.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {}
  handleChangeInput = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  };
  savePassword = () => {
    const self = this;
    const pwd = this.state.pwd;
    const repwd = this.state.repwd;
    const crpwd = this.state.crpwd;
    const infoMember = getUser();
    if (!infoMember) return false;
    const username =
      infoMember.acc_type === "M"
        ? infoMember?.MobilePhone
        : infoMember?.UserName;
    const password = getPassword();
    var bodyData = new FormData();
    bodyData.append("pwd", pwd); // New Password
    bodyData.append("repwd", repwd); // Nhập lại mật khẩu mới
    bodyData.append("crpwd", crpwd); // Mật khẩu hiện tai

    var isSubmit = true;
    self.$f7.preloader.show();
    if (
      crpwd === undefined ||
      crpwd === "" ||
      pwd === undefined ||
      pwd === ""
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin.", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 2500,
      });
      self.$f7.preloader.hide();
      this.resetValue();
      isSubmit = false;
      return false;
    }
    if (pwd !== repwd) {
      self.$f7.preloader.hide();
      toast.error("Nhập lại mật khẩu mới không trùng khớp.", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 2500,
      });
      this.setState({
        repwd: "",
      });
      isSubmit = false;
      return false;
    }

    if (isSubmit === true) {
      UserService.updatePassword(username, password, bodyData)
        .then((response) => {
          setTimeout(() => {
            self.$f7.preloader.hide();
            if (response.data.error) {
              toast.error(response.data.error, {
                position: toast.POSITION.TOP_LEFT,
                autoClose: 2000,
              });
              self.resetValue();
            } else {
              toast.success("Cập nhập mật khẩu mới công !", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 1000,
              });
              localStorage.setItem("password", pwd);
              self.resetValue();
              self.$f7router.back();
            }
          }, 1000);
        })
        .catch((err) => console.log(err));
    }
  };

  resetValue = () => {
    this.setState({
      pwd: "",
      repwd: "",
      crpwd: "",
    });
  };

  render() {
    const memberInfo = this.state.memberInfo;
    return (
      <Page name="edit-password" noToolbar noNavbar>
        <div className="page-edit-password">
          <div className="profile-bg">
            <div className="page-login__back">
              <Link onClick={() => this.$f7router.back()}>
                <i className="las la-arrow-left"></i>
              </Link>
            </div>
            <div className="name">Thay đổi Mật khẩu</div>
            <img src={bgImage} />
          </div>
          <div className="profile-info">
            <div className="profile-info__avatar">
              <img src={IconChangePassword} />
            </div>
          </div>
          <form>
            <div className="edit-email__box">
              <div className="note">
                <span>(*)</span>Bạn muốn thay đổi mật khẩu hiện tại. Vui lòng
                cập nhập đầy đủ thông tin dưới đây.
              </div>
              <div className="box-form">
                <div className="page-login__form-item">
                  <label>Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    name="crpwd"
                    value={this.state.crpwd || ""}
                    autoComplete="off"
                    onChange={this.handleChangeInput}
                    placeholder="Nhập mật khẩu của bạn"
                    className="input-customs"
                  />
                </div>
                <div className="page-login__form-item">
                  <label>Mật khẩu mới</label>
                  <input
                    type="password"
                    name="pwd"
                    value={this.state.pwd || ""}
                    autoComplete="off"
                    onChange={this.handleChangeInput}
                    placeholder="Nhập mật khẩu mới"
                    className="input-customs"
                  />
                </div>
                <div className="page-login__form-item">
                  <label>Nhập lại mật khẩu mới</label>
                  <input
                    type="password"
                    value={this.state.repwd || ""}
                    name="repwd"
                    autoComplete="off"
                    onChange={this.handleChangeInput}
                    placeholder="Nhập lại mật khẩu mới"
                    className="input-customs"
                  />
                </div>
                <div className="page-login__form-item">
                  <button
                    type="button"
                    className="btn-login btn-me btn-no-image"
                    onClick={() => this.savePassword()}
                  >
                    <span>Lưu thay đổi</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Page>
    );
  }
}
