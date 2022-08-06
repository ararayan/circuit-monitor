export const YN_BASE_URL = 'http://172.16.20.138/APIServer/api';

export enum YNAPI_System {
    Login = '/System/Login',
    LogOut = '/System/LogOut',
    UpdatePwd = '/System/UpdatePwd',
    GetUserMenus = '/getUserMenus',
    CheckPassword = '/checkPassword',
}

export enum YNAPI_JXT {
  GetList = '/PtlInterface/JXT_GetList',
  GetPicture = '/PtlInterface/JXT_GetPicture',
  GetPCBStatus = '/PtlInterface/JXT_GetValueByIDs',
}
