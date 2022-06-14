import http from "../service/http-common";
import qs from 'qs';
import { getToken } from "../constants/user";

class StaffService {
    getServiceStaff(user, data) {
        return http.post(`/app/index.aspx?cmd=member_sevice&token=${getToken()}&IsUser=1&StockID=${user.StockID}`, qs.stringify(data))
    }
    getStaffService(user, data) {
        return http.post(`/app/index.aspx?cmd=get_staff_service&token=${getToken()}&IsUser=1&StockID=${user.StockID}`, qs.stringify(data))
    }
    getSurchargeStaff(user, data) {
        return http.post(`/app/index.aspx?cmd=service_fee&token=${getToken()}&IsUser=1&StockID=${user.StockID}`, qs.stringify(data))
    }
    serviceDoneStaff(user, data) {
        return http.post(`/app/index.aspx?cmd=staff_done_service&token=${getToken()}&IsUser=1&StockID=${user.StockID}`, qs.stringify(data))
    }
    getImageStaff(osid) {
        return http.get(`/api/v3/orderservice?cmd=attachment&osid=${osid}`)
    }
    uploadImageStaff(file) {
        return http.post(`/api/v3/file?cmd=upload`, file);
    }
    updateImageStaff(id, data) {
        return http.post(`/api/v3/orderservice?cmd=attachment&osid=${id}`, qs.stringify(data));
    }
    deleteImageStaff(id, deletes) {
        return http.post(`/api/v3/orderservice?cmd=attachment&osid=${id}`, qs.stringify(deletes));
    }
    getNotiStaff(user, data) {
        return http.post(`/app/index.aspx?cmd=noti&token=${getToken()}&IsUser=1&StockID=${user.StockID}`, qs.stringify(data));
    }
    addNotiStaff(user, data) {
        return http.post(`/app/index.aspx?cmd=service_note&token=${getToken()}&IsUser=1&StockID=${user.StockID}`, qs.stringify(data));
    }
    getBookStaff(user, data) {
        return http.post(`/app/index.aspx?cmd=booklist&token=${getToken()}&IsUser=1&StockID=${user.StockID}`, qs.stringify(data))
    }
    getSalary(userID, mon) {
        return http.get(`api/v3/usersalary?cmd=salary&userid=${userID}&mon=${mon}`)
    }
}

export default new StaffService();