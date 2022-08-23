export const YN_BASE_URL = 'http://192.168.1.2/WebAPI/api'; //'http://172.16.20.138/APIServer/api';

export enum YNAPI_System {
    Login = '/System/Login',
    LogOut = '/System/LogOut',
    UpdatePwd = '/System/UpdatePwd',
    CheckPassword = '/System/CheckPassword',
    GetUserMenus = '/getUserMenus', //local
}

export enum YNAPI_JXT {
  GetList = '/PtlInterface/JXT_GetList',
  GetPicture = '/PtlInterface/JXT_GetPicture',
  GetPCBStatus = '/PtlInterface/JXT_GetValueByIDs',
}

export enum YNAPI_KZCZ {
  GetList = '/PtlInterface/KZCZ_GetList',
  GetDetail = '/PtlInterface/KZCZ_GetDetail',
  RemoteSelect = '/PtlInterface/KZCZ_RemoteSelect',
  RemoteExcute = '/PtlInterface/KZCZ_RemoteExcute',
  CheckControlResult = '/PtlInterface/KZCZ_CheckControlResult',
}

export enum YNAPI_JGSJ {
  GetList = '/PtlInterface/JGSJ_GetList',
  GetData = '/PtlInterface/JGSJ_SSSJ_GetData',
}

export enum YNAPI_ZMGL {
  GetList = '/PtlInterface/ZMGL_GetList',
}


