import React from "react";
import {
  Col,
  f7,
  Link,
  Navbar,
  Page,
  PhotoBrowser,
  Row,
  Sheet,
  Toolbar,
} from "framework7-react";
import NotificationIcon from "../../../components/NotificationIcon";
import SelectStock from "../../../components/SelectStock";
import {
  getPassword,
  getStockIDStorage,
  getUser,
} from "../../../constants/user";
import { formatPriceVietnamese } from "../../../constants/format";
import staffService from "../../../service/staff.service";
import userService from "../../../service/user.service";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SERVER_APP } from "../../../constants/config";
import { VscChromeClose, VscCloudUpload } from "react-icons/vsc";
import { TiCameraOutline } from "react-icons/ti";
import SkeletonDetail from "./skeleton/SkeletonDetail";
import { CALL_PHONE, PHOTO_TO_SERVER } from "../../../constants/prom21";
import Resizer from "react-image-file-resizer";


toast.configure();

export default class employeeServiceDetail extends React.Component {
  constructor() {
    super();
    this.state = {
      sheetOpened: false,
      loadingSubmit: false,
      photos: [],
      isLoading: true,
    };
  }

  componentDidMount() {
    this.getService();
    this.getStaffService();
    this.getStock();
    this.getImageStaff();
  }

  getStaffService = () => {
    if (!getUser()) return false;
    const infoMember = getUser();
    const user = {
      USN: infoMember.UserName,
      PWD: getPassword(),
      StockID: getStockIDStorage(),
    };
    const cateID = this.$f7route.params.id;
    const data = {
      cmd: "get_staff_service",
      arr: cateID,
    };
    staffService
      .getStaffService(user, data)
      .then((response) => {
        const result = response.data;
        const resultNew = result.map((user) => {
          return user.StaffName;
        });
        this.setState({
          performStaff: resultNew.join(", "),
        });
      })
      .catch((error) => console.log(error));
  };

  getService = async () => {
    if (!getUser()) return false;
    const infoMember = getUser();
    const user = {
      USN: infoMember.UserName,
      PWD: getPassword(),
      StockID: getStockIDStorage(),
    };
    const data = {
      cmd: "member_sevice",
      IsManager: 1,
      IsService: 1,
      MemberIDs: "",
      srv_status: "book,wait_book,wait,doing,done,cancel",
      srv_from: "1/1/2015",
      srv_to: "1/1/2030",
      key: "",
      ps: 1000,
    };

    try {
      const cateID = this.$f7route.params.id;
      const response = await staffService.getServiceStaff(user, data);
      const result = response.data.data;
      const itemDetail = result.find((item) => item.ID === parseInt(cateID));
      const dataPP = {
        cmd: "service_fee",
        OrderServiceID: itemDetail.ID,
        MemberID: itemDetail.MemberID,
      };
      const responseSurcharge = await staffService.getSurchargeStaff(
        user,
        dataPP
      );
      const resultSurcharge = responseSurcharge.data[0].OS[0].Fee;
      const resulSurchargetNew = resultSurcharge.map((item) => {
        return `(${item.Assign}) ${item.Title}`;
      });
      this.setState({
        itemDetail: itemDetail,
        surcharget: resulSurchargetNew.join(", "),
      });
      setTimeout(() => {
        this.setState({ isLoading: false });
      }, 200);
    } catch (error) {
      console.log(error);
    }
  };

  getStock = () => {
    userService
      .getStock()
      .then((response) => {
        const ListStock = response.data.data.all;
        this.setState({
          ListStock: ListStock,
        });
      })
      .catch((err) => console.log(err));
  };

  openStock = () => {
    this.setState({
      isOpenStock: !this.state.isOpenStock,
    });
  };

  checkStock = (stockid) => {
    const { ListStock } = this.state;
    if (!stockid) return false;
    const currentStock =
      ListStock && ListStock.find((stock) => stock.ID === stockid);
    return currentStock.Title;
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

  handleNote = (evt) => {
    const value = evt.target.value;
    this.setState({
      Note: value,
    });
  };

  orderSubmit = (ServiceID) => {
    const { Note } = this.state;
    if (!getUser()) return false;
    const infoMember = getUser();
    const user = {
      USN: infoMember.UserName,
      PWD: getPassword(),
      StockID: getStockIDStorage(),
    };

    const data = {
      cmd: "staff_done_service",
      ServiceID: ServiceID,
      note: Note || "Không có ghi chú",
    };
    this.setState({
      loadingSubmit: true,
    });

    staffService
      .serviceDoneStaff(user, data)
      .then((response) => {
        if (!response.data.error) {
          setTimeout(() => {
            toast.success("Báo có hoàn thành thành công !", {
              position: toast.POSITION.TOP_LEFT,
              autoClose: 2000,
            });
            this.setState({
              loadingSubmit: false,
              sheetOpened: false,
            });
            this.getService();
          }, 1000);
        }
      })
      .catch((err) => console.log(err));
  };

  openBrowserImage = (index) => {
    this.closeSheet();
    this.standaloneDark.open(index);
  };

  getImageStaff = () => {
    const cateID = this.$f7route.params.id;
    const newPhotos = [];
    staffService
      .getImageStaff(cateID)
      .then((response) => {
        response.data.data.map((item) => {
          const itemPhoto = {
            url: `${SERVER_APP}/Upload/image/${item.Src}`,
            id: item.ID,
            OrderServiceID: item.OrderServiceID,
          };
          newPhotos.push(itemPhoto);
        });

        this.setState({
          photos: newPhotos,
        });
      })
      .catch((err) => console.log(err));
  };

  updateImageServer = (src) => {
    const cateID = this.$f7route.params.id;
    const dataSrc = {
      src: src,
    };
    staffService
      .updateImageStaff(cateID, dataSrc)
      .then((response) => {})
      .catch((error) => console.log(error));
  };

  resizeFile = (file) => {
    return new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        1500,
        1500,
        "JPEG",
        100,
        0,
        (uri) => {
          resolve(uri);
        },
        "file",
        300,
        300
      );
    });
  };

  handleUploadFile = async (event) => {
    f7.dialog.preloader("Đang Upload...");
    try {
      const image = await this.resizeFile(event.target.files[0]);
      const formData = new FormData();
      formData.append("file", image);
      const upload = await staffService.uploadImageStaff(formData);
      const src = upload.data.data;
      await this.updateImageServer(src);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.getImageStaff();
      setTimeout(() => {
        f7.dialog.close();
      }, 1000);
    } catch (error) {
      console.log(error);
    }
  };

  handleDeleteImage = (item) => {
    const iddelete = {
      delete: item.id,
    };

    f7.dialog.confirm("Bạn muốn xóa ảnh này ?", () => {
      f7.dialog.preloader("Đang thực hiện xóa...");
      staffService
        .deleteImageStaff(item.OrderServiceID, iddelete)
        .then((response) => {
          if (response.data.success) {
            const asyncCall = async () => {
              const getImage = await this.getImageStaff();
              await new Promise((resolve) => setTimeout(resolve, 500));
              f7.dialog.close();
            };
            asyncCall();
          }
        })
        .catch((error) => console.log(error));
    });
  };

  handleCamera = () => {
    PHOTO_TO_SERVER()
      .then((rs) => {
        f7.dialog.preloader("Đang Upload...");
        const upload = async () => {
          try {
            const updateImage = await this.updateImageServer(rs.data);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const getImage = await this.getImageStaff();
            setTimeout(() => {
              f7.dialog.close();
            }, 1000);
          } catch (error) {
            console.log(error);
          }
        };
        upload();
      })
      .catch((z) => console.log("aaa Error:", z));
  };

  onCallPhone = (phone) => {
    if (phone) {
      CALL_PHONE(phone);
    }
  };

  render() {
    const {
      itemDetail,
      performStaff,
      surcharget,
      photos,
      sheetOpened,
      loadingSubmit,
      isLoading,
    } = this.state;
    return (
      <Page name="employee-service">
        <Navbar>
          <div className="page-navbar">
            <div className="page-navbar__back">
              <Link
                onClick={() =>
                  this.$f7router.back()
                }
              >
                <i className="las la-angle-left"></i>
              </Link>
            </div>
            <div className="page-navbar__title">
              <span className="title">{itemDetail && itemDetail.Title}</span>
            </div>
            <div className="page-navbar__noti">
              <NotificationIcon />
            </div>
          </div>
        </Navbar>
        <div className="page-render employee-service-detail p-0">
          <div className="list-detail">
            {isLoading && <SkeletonDetail />}
            {!isLoading && (
              <ul>
                <li>
                  <span className="w-100">Dịch vụ</span>
                  <span className="w-100">
                    {itemDetail && itemDetail.Title}
                  </span>
                </li>
                <li>
                  <span>Khách hàng</span>
                  <span>{itemDetail && itemDetail.member.FullName}</span>
                </li>
                <li>
                  <span>Địa chỉ</span>
                  <span>
                    {itemDetail && (
                      <>
                        {itemDetail.member.HomeAddress === ""
                          ? "Chưa có"
                          : itemDetail.member.HomeAddress}
                      </>
                    )}
                  </span>
                </li>
                <li>
                  <span>Công nợ</span>
                  <span>
                    {formatPriceVietnamese(
                      itemDetail && itemDetail.member.Present.no
                    )}
                  </span>
                </li>
                <li>
                  <span>Ví</span>
                  <span>
                    {formatPriceVietnamese(
                      itemDetail && itemDetail.member.Present.nap_vi
                    )}
                  </span>
                </li>
                <li>
                  <span>Thẻ tiền</span>
                  <span>
                    {formatPriceVietnamese(
                      itemDetail && itemDetail.member.Present.the_tien_kha_dung
                    )}
                  </span>
                </li>
                {itemDetail && itemDetail.Status === "done" ? (
                  <li>
                    <span className="w-100">Ghi chú</span>
                    <span className="w-100">
                      {(itemDetail && itemDetail.Desc) || "Không có ghi chú"}
                    </span>
                  </li>
                ) : (
                  ""
                )}
                <li>
                  <span>Số điện thoại</span>
                  <span
                    onClick={() =>
                      this.onCallPhone(
                        itemDetail && itemDetail.member.MobilePhone
                      )
                    }
                    className="text-link"
                  >
                    {itemDetail && itemDetail.member.MobilePhone}
                  </span>
                </li>
                <li>
                  <span>Thời gian</span>
                  <span>{itemDetail && itemDetail.BookStr}</span>
                </li>
                <li>
                  <span>Số phút</span>
                  <span>{itemDetail && (itemDetail.Minutes || 0)}p /Ca</span>
                </li>
                <li>
                  <span>Điểm</span>
                  <span>
                    {itemDetail && this.checkStock(itemDetail.StockID)}
                  </span>
                </li>
                <li>
                  <span className="w-100">Nhân viên thực hiện</span>
                  <span className="w-100">{performStaff && performStaff}</span>
                </li>
                <li>
                  <span className="w-100">Phụ phí</span>
                  <span className="w-100">
                    {(surcharget && surcharget) || "Chưa có phụ phí"}
                  </span>
                </li>
              </ul>
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
                  {itemDetail && itemDetail.Status !== "done" ? (
                    <div className="item">
                      <label>Ghi chú</label>
                      <textarea
                        placeholder="Nhập ghi chú"
                        onChange={this.handleNote}
                      ></textarea>
                    </div>
                  ) : (
                    ""
                  )}
                  <div className="item">
                    <label>Hình ảnh dịch vụ</label>
                    <div className="list-images">
                      <Row>
                        {photos.map((item, index) => (
                          <Col width="33" key={index}>
                            <div className="list-images__item">
                              <img
                                src={item.url}
                                onClick={() => this.openBrowserImage(index)}
                              />
                              <div
                                className="delete"
                                onClick={() => this.handleDeleteImage(item)}
                              >
                                <VscChromeClose />
                              </div>
                            </div>
                          </Col>
                        ))}
                        <Col width="33">
                          <div
                            className="list-images__item add-item"
                            onClick={() => this.handleCamera()}
                          >
                            <TiCameraOutline />
                            <span>Chụp ảnh</span>
                          </div>
                        </Col>
                        <Col width="33">
                          <div className="list-images__item add-item">
                            <VscCloudUpload />
                            <span>Upload ảnh</span>
                            <input
                              type="file"
                              name="uploadfile"
                              accept="image/*"
                              onChange={this.handleUploadFile}
                            />
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </div>
                <div className="sheet-pay-body__btn">
                  {itemDetail && itemDetail.Status === "done" ? (
                    <button
                      className={`page-btn-order btn-submit-order`}
                      onClick={() => this.closeSheet()}
                    >
                      <span>Đóng</span>
                      <div className="loading-icon">
                        <div className="loading-icon__item item-1"></div>
                        <div className="loading-icon__item item-2"></div>
                        <div className="loading-icon__item item-3"></div>
                        <div className="loading-icon__item item-4"></div>
                      </div>
                    </button>
                  ) : (
                    <button
                      className={`page-btn-order btn-submit-order ${
                        loadingSubmit && "loading"
                      }`}
                      onClick={() => this.orderSubmit(itemDetail.ID)}
                    >
                      <span>Hoàn thành</span>
                      <div className="loading-icon">
                        <div className="loading-icon__item item-1"></div>
                        <div className="loading-icon__item item-2"></div>
                        <div className="loading-icon__item item-3"></div>
                        <div className="loading-icon__item item-4"></div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Sheet>

        <PhotoBrowser
          photos={photos}
          theme="dark"
          type="popup"
          popupCloseLinkText="Đóng"
          navbarOfText="/"
          ref={(el) => {
            this.standaloneDark = el;
          }}
        />

        <Toolbar tabbar position="bottom">
          <div className="page-toolbar">
            <div className="page-toolbar__order">
              <button
                className={`page-btn-order btn-submit-order ${
                  itemDetail && itemDetail.Status === "done" ? "success" : ""
                }`}
                onClick={() => this.openSheet()}
              >
                <span>
                  {itemDetail && itemDetail.Status === "done"
                    ? "Xem hình ảnh"
                    : "Báo cáo xong"}
                </span>
              </button>
            </div>
          </div>
        </Toolbar>
        <SelectStock isOpenStock={this.state.isOpenStock} />
      </Page>
    );
  }
}
