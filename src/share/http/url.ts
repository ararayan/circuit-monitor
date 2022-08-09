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

export enum YNAPI_KZCZ {
  GetDetail = '/PtlInterface/KZCZ_GetDetail',
  RemoteSelect = '/PtlInterface/KZCZ_RemoteSelect',
  RemoteExcute = '/PtlInterface/KZCZ_RemoteExcute',
  CheckControlResult = '/PtlInterface/KZCZ_CheckControlResult',
}

export enum YNAPI_JGSJ {
  GetList = '/PtlInterface/JGSJ_GetList',
  GetData = '/PtlInterface/JGSJ_SSSJ_GetData',
}



