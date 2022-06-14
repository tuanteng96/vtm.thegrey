import {
  Navbar,
  Toolbar,
  Page,
  Link,
  Button,
  Sheet,
  PageContent,
} from "framework7-react";
import React from "react";
import IconSucces from "../../assets/images/box.svg";
import NotificationIcon from "../../components/NotificationIcon";
import ToolBarBottom from "../../components/ToolBarBottom";
import userService from "../../service/user.service";
import Skeleton from "react-loading-skeleton";
import ReactHtmlParser from "react-html-parser";
import { formatPriceVietnamese } from "../../constants/format";

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      loadingText: false,
      textPay: ""
    };
  }
  componentDidMount() {
    // const userInfo = getUser();
    // if (!userInfo) return false;
    // const pwd = getPassword();
    // UserService.getInfo(userInfo.MobilePhone, pwd)
    //   .then((response) => {
    //     const data = response.data.info;
    //     setUserStorage(data.etoken, data, pwd);
    //   })
    //   .catch((er) => console.log(er));

    this.setState({
      loadingText: true,
    });
    userService
      .getConfig("App.thanhtoan")
      .then(({ data }) => {
        this.setState({
          textPay: data.data && data.data[0]?.ValueLines,
          loadingText: false,
        });
      })
      .catch((error) => console.log(error));
  }
  render() {
    const { loadingText, textPay } = this.state;
    return (
      <Page
        onPageBeforeOut={this.onPageBeforeOut}
        onPageBeforeRemove={this.onPageBeforeRemove}
        name="shop-pay-success"
      >
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link href="/news/">
                <i className="las la-home"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">Thành công</span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>
        <div className="page-render no-bg p-0">
          <div className="page-pay no-bg">
            <div className="page-pay-success">
              <div className="image">
                <img src={IconSucces} alt="Đơn hàng được gửi thành công!" />
              </div>
              <div className="text">
                Đơn hàng <span>#{this.$f7route.params.orderID}</span> của bạn đã
                được gửi thành công. Cảm ơn quý khách !
              </div>
              <div className="btn">
                <Link href="/order/">Đơn hàng của bạn</Link>
                <Link href="/shop/">Tiếp tục mua hàng</Link>
                <Button sheetOpen={`.demo-sheet`} className="show-more">
                  Hướng dẫn thanh toán
                </Button>
              </div>
              <Sheet
                className={`demo-sheet sheet-detail sheet-detail-order`}
                style={{
                  height: "auto !important",
                  "--f7-sheet-bg-color": "#fff",
                }}
                swipeToClose
                backdrop
              >
                <Button sheetClose={`.demo-sheet`} className="show-more">
                  <i className="las la-times"></i>
                </Button>
                <PageContent>
                  <div className="page-shop__service-detail">
                    <div className="title">
                      <h4>Thanh toán đơn hàng #</h4>
                    </div>
                    <div className="content">
                      {loadingText && <Skeleton count={6} />}
                      {!loadingText &&
                        textPay &&
                        ReactHtmlParser(
                          textPay
                            .replaceAll(
                              "ID_ĐH",
                              `#${this.$f7route.params.orderID}`
                            )
                            .replaceAll(
                              "MONEY",
                              `${formatPriceVietnamese(
                                Math.abs(this.$f7route.query.money)
                              )} ₫`
                            )
                            .replaceAll(
                              "ID_DH",
                              `${this.$f7route.params.orderID}`
                            )
                        )}
                    </div>
                  </div>
                </PageContent>
              </Sheet>
            </div>
          </div>
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>
      </Page>
    );
  }
}
