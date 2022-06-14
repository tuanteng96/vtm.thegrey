import React, { Suspense } from "react";
import bgHeaderTop from "../../assets/images/bg-header-home.png";
import { Page, Link, Toolbar, f7 } from "framework7-react";
import UserService from "../../service/user.service";
import IconSearch from "../../assets/images/icon-search.png";
import { FaRegUser, FaMapMarkerAlt, FaChevronDown } from "react-icons/fa";
const ModalReviews = React.lazy(() => import("../../components/ModalReviews"));
const SelectStock = React.lazy(() => import("../../components/SelectStock"));
import CartToolBar from "../../components/CartToolBar";
import ToolBarBottom from "../../components/ToolBarBottom";
import NotificationIcon from "../../components/NotificationIcon";
import {
  getUser,
  setStockIDStorage,
  getStockIDStorage,
  setStockNameStorage,
  getStockNameStorage,
  removeStockNameStorage,
} from "../../constants/user";
import ListService from "./components/Service/ListService";
import SlideList from "../home/components/BannerSlide/SlideList";
import ServiceHot from "./components/ServiceHot/ServiceHot";
import SlideListCenter from "./components/BannerSlide/SlideListCenter";
const ListImage = React.lazy(() =>
  import("../home/components/Customer/ListImage")
);
const NewsList = React.lazy(() => import("../home/components/news/NewsList"));
const QuickAction = React.lazy(() => import("../../components/quickAction"));
const ProductList = React.lazy(() =>
  import("../home/components/Product/ProductList")
);

export default class extends React.Component {
  constructor() {
    super();
    this.state = {
      arrNews: [],
      isOpenStock: false,
      width: window.innerWidth,
      showPreloader: false,
      isReload: 0,
    };
  }

  componentDidMount() {
    const stockName = getStockNameStorage();
    this.setState({
      stockName: stockName,
    });
  }
  onPageBeforeIn = () => {
    const getStock = getStockIDStorage();

    UserService.getStock()
      .then((response) => {
        let indexStock = 0;
        const arrStock = response.data.data.all;

        const countStock = arrStock.length;
        const CurrentStockID = response.data.data.CurrentStockID;
        if (getStock) {
          indexStock = arrStock.findIndex(
            (item) => item.ID === parseInt(getStock)
          );
        }
        const indexCurrentStock = arrStock.findIndex(
          (item) => item.ID === parseInt(CurrentStockID)
        );

        if (countStock === 2) {
          const StockID = arrStock.slice(-1)[0].ID;
          const TitleStockID = arrStock.slice(-1)[0].Title;
          setStockIDStorage(StockID);
          setStockNameStorage(TitleStockID);
          this.setState({
            isReload: this.state.isReload + 1,
            stockName: TitleStockID,
          });
        }
        setTimeout(() => {
          if (indexCurrentStock <= 0 && indexStock <= 0 && countStock > 2) {
            removeStockNameStorage();
            this.setState({
              isOpenStock: true,
              stockName: null,
            });
          }
        }, 500);
      })
      .catch((e) => console.log(e));
  };

  handleStock = () => {
    this.setState({
      isOpenStock: !this.state.isOpenStock,
    });
  };

  nameStock = (name) => {
    this.setState({
      stockName: name,
    });
  };

  searchPage = () => {
    this.$f7router.navigate("/search/");
  };

  loadRefresh(done) {
    setTimeout(() => {
      this.$f7.views.main.router.navigate(this.$f7.views.main.router.url, {
        reloadCurrent: true,
      });
      this.setState({
        showPreloader: true,
      });
      done();
    }, 1000);
  }

  render() {
    const { isOpenStock, stockName, isReload } = this.state;
    return (
      <Page
        noNavbar
        name="home"
        onPageBeforeIn={() => this.onPageBeforeIn()}
        ptr
        infiniteDistance={50}
        infinitePreloader={this.state.showPreloader}
        onPtrRefresh={this.loadRefresh.bind(this)}
      >
        <div className="page-wrapper">
          <div className="page-render p-0">
            <div className="home-page">
              <div className="home-page__header">
                <div
                  className="top"
                  style={{
                    background: `url(${bgHeaderTop}) center bottom/cover no-repeat white`,
                  }}
                >
                  <div className="top-content">
                    <div
                      className="location"
                      onClick={() => this.handleStock()}
                    >
                      <FaMapMarkerAlt />
                      <div className="location-name">
                        {stockName && stockName ? stockName : "Bạn đang ở ?"}
                      </div>
                      <div className="down">
                        <FaChevronDown />
                      </div>
                    </div>
                    <div className="menu">
                      <CartToolBar />
                      <NotificationIcon />
                    </div>
                  </div>
                </div>
                <div className="body">
                  <div className="body-search">
                    <button type="button">
                      <img src={IconSearch} />
                    </button>
                    <input
                      type="text"
                      placeholder="Bạn tìm gì hôm nay ?"
                      onFocus={this.searchPage}
                    ></input>
                  </div>
                  <SlideList BannerName="App.Banner" autoplaySpeed={3000} />
                  <ListService className={`mt-8px ${getUser() ? "" : "mb-10px"}`} id="42" />
                  {getUser() && <ListService className="my-10px" id="45" />}
                </div>
              </div>
              <ServiceHot f7={this.$f7router} />
              <Suspense fallback={<div>Loading...</div>}>
                <ListImage />
              </Suspense>
              <SlideList
                className="banner-main bg-white px-15px pt-15px"
                BannerName="App.Main"
                autoplaySpeed={4000}
              />
              <SlideListCenter
                className="mb-8px px-15px pb-15px pt-12px"
                BannerName="App.MainSale"
                autoplaySpeed={4500}
              />
              <Suspense fallback={<div>Loading...</div>}>
                <SlideList
                  containerClass="pl-15px pr-15px slider-hot"
                  BannerName="App.DVHOT"
                />
              </Suspense>
              <Suspense fallback={<div>Loading...</div>}>
                <ProductList />
              </Suspense>
              <Suspense fallback={<div>Loading...</div>}>
                <NewsList />
              </Suspense>
            </div>
          </div>
        </div>
        <Toolbar tabbar position="bottom">
          <ToolBarBottom />
        </Toolbar>

        <Suspense fallback={<div>Loading...</div>}>
          <SelectStock
            isOpenStock={isOpenStock}
            nameStock={(name) => this.nameStock(name)}
            isReload={isReload}
          />
          <ModalReviews />
          <QuickAction />
        </Suspense>
      </Page>
    );
  }
}
