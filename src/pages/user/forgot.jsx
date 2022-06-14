import React from "react";
import { Link, Page } from "framework7-react";
import IconForgot from "../../assets/images/forgot-password.png";
import userService from "../../service/user.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import IframeResizer from "iframe-resizer-react";
import { auth, database } from "../../firebase/firebase";
import { ref, onValue, set } from "firebase/database";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { iOS } from "../../constants/helpers";
import { SERVER_APP } from "../../constants/config";
import { uuid } from "../../constants/helpers";
toast.configure();

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      input: "",
      iFrameHeight: "0px",
      Uuid: "",
    };
  }

  componentDidMount() {
    const starCountRef = ref(database, "token");
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      const { Uuid } = this.state;
      const dataArr = data
        ? Object.keys(data).map((key) => {
            return { ...data[key], Key: key };
          })
        : [];
      if (dataArr.findIndex((item) => item.Key === Uuid) > -1) {
        toast.success("Mật khẩu mới đã được thay đổi thành công !", {
          position: toast.POSITION.TOP_LEFT,
          autoClose: 3000,
        });
        set(ref(database, `/token/${this.state.Uuid}`), null).then(() => {
          this.$f7router.navigate("/login/");
        });
      }
    });

    if (!iOS()) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "sign-in-button",
        {
          size: "invisible",
          callback: (response) => {
            this.handleSubmit();
          },
        },
        auth
      );
      window.recaptchaVerifier.render().then((widgetId) => {
        window.recaptchaWidgetId = widgetId;
      });
    } else {
      this.setState({ Uuid: uuid() });
      this.$f7.dialog.preloader("Đang tải ...");
    }
  }

  handleChangeInput = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value,
    });
  };

  handleSubmit = (event) => {
    //event.preventDefault();
    if (this.state.input === "") {
      toast.error("Vui lòng nhập số điện thoại hoặc Email !", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 3000,
      });
      return;
    }
    this.setState({
      loading: true,
    });
    var PhoneRegex = /(840|84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    var isPhone = PhoneRegex.test(this.state.input);

    var bodyFormData = new FormData();
    bodyFormData.append("input", this.state.input);
    bodyFormData.append("loading", true);
    bodyFormData.append("mess", "");
    bodyFormData.append("error", "");
    bodyFormData.append("currentPhoneNumber", "");

    userService
      .authForget(bodyFormData)
      .then(async ({ data }) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (data.error) {
          let TextErr = data.error;
          if (data.error === "EMAIL_WRONG") {
            TextErr = "Email hoặc số điện thoại không hợp lệ.";
          }
          if (data.error === "EMAIL_NOT_REG") {
            TextErr = "Email hoặc số điện thoại chưa đăng ký.";
          }
          if (data.error === "FORGET_METHOD_OVER_SECTION") {
            TextErr = "Vượt quá số lượng đổi mật khẩu trong ngày.";
          }
          toast.error(TextErr, {
            position: toast.POSITION.TOP_LEFT,
            autoClose: 3000,
          });
          window.recaptchaVerifier.render().then(function (widgetId) {
            grecaptcha.reset(widgetId);
          });
          this.setState({
            loading: false,
          });
          return;
        }

        if (isPhone) {
          const phoneNumber = `+84${this.state.input}`;
          const appVerifier = window.recaptchaVerifier;
          signInWithPhoneNumber(auth, phoneNumber, appVerifier)
            .then((confirmationResult) => {
              // SMS sent. Prompt user to type the code from the message, then sign the
              // user in with confirmationResult.confirm(code).
              this.setState({
                loading: false,
              });
              window.confirmationResult = confirmationResult;
              this.$f7router.navigate(
                `/forgot-change/?phone=${this.state.input}`
              );
            })
            .catch((error) => {
              window.recaptchaVerifier.render().then(function (widgetId) {
                grecaptcha.reset(widgetId);
              });
              console.log(error);
              // Error; SMS not sent
              // ...
            });
        } else {
          this.setState({
            loading: false,
          });
          this.$f7router.navigate("/forgot-change/");
        }
      })
      .catch((error) => console.log(error));
  };

  render() {
    const { loading, Uuid } = this.state;
    return (
      <Page noNavbar noToolbar name="forgot">
        <div className={`page-forgot h-100 ${iOS() && "page-forgot-ios"}`}>
          <div className="to-back">
            <Link onClick={() => this.$f7router.back()}>
              <i className="las la-arrow-left"></i>
            </Link>
          </div>
          <div className="page-forgot__content text-center">
            <div className="page-forgot-about">
              <h4>Quên mật khẩu</h4>
              <div className="desc">
                Nhập địa chỉ email hoặc số điện thoại và chúng tôi sẽ gửi cho
                bạn một liên kết để đặt lại mật khẩu.
              </div>
              <img className="logo-reg" src={IconForgot} />
            </div>
            {iOS() && Uuid && (
              <IframeResizer
                heightCalculationMethod="bodyScroll"
                src={`${SERVER_APP}/App2021/forgotUI?uuid=${Uuid}`}
                style={{ border: 0 }}
                onLoad={() => this.$f7.dialog.close()}
              />
            )}
            <div className={`${iOS() && "d-none"}`}>
              <div className="page-login__form-item">
                <input
                  type="text"
                  name="input"
                  autoComplete="off"
                  placeholder="Số điện thoại hoặc Email"
                  onChange={this.handleChangeInput}
                />
              </div>
              <div className="page-login__form-item">
                <button
                  type="submit"
                  className={`btn-login btn-me ${loading ? "loading" : ""}`}
                  id="sign-in-button"
                >
                  <span>Nhận mã</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Page>
    );
  }
}
