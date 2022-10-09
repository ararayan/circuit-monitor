import { Directory, Encoding, Filesystem, GetUriOptions } from "@capacitor/filesystem";

class PcbFielCache {
  async writePCBImageFile (path: string, data: string, directory: Directory = Directory.Data) {
    const result = await Filesystem.writeFile({
      path,
      data,
      directory,
      encoding: Encoding.UTF8,
    });
    return result;
    // alertController.create({
    //   message: `Write file success: ${result.uri}; path: ${path}, data: ${data.length}`,
    // }).then(x => x.present());
  }
  async readPCBImageFile (path: string, directory: Directory = Directory.Data) {
    const contents = await Filesystem.readFile({
      path,
      directory,
      encoding: Encoding.UTF8,
    });
  
    // console.log('read files:', contents);
    return  contents.data;
  }

  async deletePCBImageFile (path: string, directory: Directory = Directory.Data) {
    await Filesystem.deleteFile({
      path,
      directory: directory,
    });
  }

  async checkFileExists (getUriOptions: GetUriOptions): Promise<boolean> {
    try {
      await Filesystem.stat(getUriOptions);
      return true;
    } catch (err: any) {
      return false;
      // if (err.message === 'File does not exist') {
      //   return false;
      // }
      // throw err;
    }
  }
}




// const readFilePath = async () => {
//   // Here's an example of reading a file with a full file path. Use this to
//   // read binary data (base64 encoded) from plugins that return File URIs, such as
//   // the Camera.
//   const contents = await Filesystem.readFile({
//     path: 'file:///var/mobile/Containers/Data/Application/22A433FD-D82D-4989-8BE6-9FC49DEA20BB/Documents/text.txt'
//   });


export const pcbFielCache = new PcbFielCache();
