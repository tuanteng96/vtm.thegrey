import React, { useEffect, useRef, useState } from "react";
import IframeResizer from "iframe-resizer-react";
import { getStockIDStorage, getUser } from "../../constants/user";
import { SERVER_APP } from "../../constants/config";
import Dom7 from "dom7";
import UserService from "../../service/user.service";
import IframeComm from "react-iframe-comm";

window.Info = {
  User: getUser(),
  Stocks: [],
  CrStockID: getStockIDStorage(),
};

window.token = localStorage.getItem("token");

function IframeReport({ f7 }) {
  const iframeRef = useRef(null);
  const [isShow, setIsShow] = useState(false);

  useEffect(() => {
    var $ = Dom7;
    if ($(".dialog-preloader").length === 0) {
      f7.dialog.preloader("Đang tải báo cáo ... ");
    }
    UserService.getStock().then((response) => {
      const ListStock = response.data.data.all.filter(
        (item) => item.ID !== 778
      );
      window.Info = {
        ...window.Info,
        User: getUser(),
        Stocks: ListStock,
        CrStockID: getStockIDStorage(),
      };
      window.token = localStorage.getItem("token");
      setIsShow(true);
    });
  }, []);

  useEffect(() => {
    const iFrameElement = iframeRef && iframeRef.current;

    if (iFrameElement) {
      const postMessage = iFrameElement.contentWindow.postMessage;
      postMessage("Message from parent");
    }
  }, [iframeRef]);

  if (!isShow) {
    return "";
  }

  return (
    <IframeComm
      attributes={{
        src: `${SERVER_APP}/App23/index.html`,
        width: "100%",
        height: "100%",
        frameBorder: 0,
      }}
      postMessageData={JSON.stringify({
        Info: window.Info,
        token: window.token,
      })}
      handleReady={() => {
        f7.dialog.close();
      }}
    />
  );
}

/* <iframe
      ref={iframeRef}
      scrolling={true}
      heightCalculationMethod="bodyScroll"
      src={`${SERVER_APP}/App23/index.html`}
      style={{ border: 0, width: "100%", height: "100%" }}
      onLoad={() => {
        f7.dialog.close();
      }}
      id="your-frame-id"
    /> */

export default IframeReport;
