import {
    readFileSync,
    writeFileSync,
    accessSync,
    existsSync,
    mkdirSync,
    renameSync,
    unlinkSync,
    rmdirSync,
    appendFileSync,
  } from "fs";
  
  import { join } from "path";
  
  /**
   *
   * @param url //> string
   * @param recursive //> boolean
   * @returns //> boolean si se creo o no el directorio
   */
  export const createDirectory = (url: string, recursive = false): string => {
    const pathUrl = url; //join(__dirname, '../..', url);
    mkdirSync(pathUrl, { recursive });
    return url;
  };
  
  /**
   *
   * @param url //> string
   * @param encoding //> BufferEncoding por defecto 'utf8'
   * @returns //> string
   */
  export const readF = (
    url: string,
    encoding: BufferEncoding = "utf8",
    options: {
      json: boolean
    } = {json: false}
  ): string | string[] | null => {
  
    try {
      const pathUrl = url; //join(__dirname, '../..', url);
      return readFileSync(pathUrl, encoding);
    } catch (error: any) {
      return "FILE NOT FOUND";
    }
  };
  
  /**
   *
   * @param url //> string
   * @param data //> any o string
   * @param encoding //> BufferEncoding por defecto 'utf8'
   * @returns //> boolean si se escribio o no en el archivo
   */
  export const writeF = (
    url: string,
    data: any,
    encoding: BufferEncoding = "utf8"
  ): void | string => {
    const pathUrl = url; //join(__dirname, '../..', url);
  
    try {
      writeFileSync(pathUrl, data, {
        encoding,
        flag: "w",
        mode: 0o666,
      });
      return "OK";
    } catch (error: any) {
      return "NULL";
    }
  };
  
  /**
   *
   * @param url //> string
   * @param data //> any o string
   * @param encoding //> BufferEncoding por defecto 'utf8'
   * @returns //> boolean si se agrego o no la data a el archivo
   */
  export const addToFile = (
    url: string,
    data: any,
    encoding: BufferEncoding = "utf8"
  ): void => {
    const pathUrl = url; //join(__dirname, '../..', url);
  
    appendFileSync(pathUrl, data, {
      encoding,
      flag: "a",
      mode: 0o666,
    });
  
    return;
  };
  
  /**
   *
   * @param url //> string
   * @param newUrl //> string
   * @returns //> boolean si se renombro o no el archivo
   */
  export const renameF = (url: string, newUrl: string): void => {
    const pathUrl = url; //join(__dirname, '../..', url);
    const pathNewUrl = newUrl; //join(__dirname, '../..', newUrl);
    renameSync(pathUrl, pathNewUrl);
    return;
  };
  
  /**
   *
   * @param url //> string
   * @returns //> boolean si se elimino o no el archivo
   */
  export const removeF = (url: string): void => {
    const pathUrl = url; //join(__dirname, '../..', url);
    unlinkSync(pathUrl);
    return;
  };
  
  /**
   *
   * @param url //> string
   * @returns //> boolean si se removio o no el directorio
   */
  export const removeDirectory = (url: string): void => {
    const pathUrl = url; //join(__dirname, '../..', url);
    rmdirSync(pathUrl);
    return;
  };
  
  /**
   *
   * @param url //> string
   * @returns //> boolean si existe o no el directorio
   */
  export const verifyIsExistFolder = (url: string): boolean => {
    const pathUrl = url; //join(__dirname, '../..', url);
    try {
      accessSync(pathUrl);
      return true;
    } catch (error: any) {
      return false;
    }
  };
  
  /**
   *
   * @param url //> string
   * @returns //> boolean si existe o no el archivo
   */
  export const verifyIsExistFile = (
    url: string,
    options: {
      action: "read" | "write" | "add";
      data: any;
    }
  ): any => {
    const { action, data } = options;  
    ({
      "read": () => {
        const file = readF(url);
        return file;
      },
      "write": () => writeF(url, data),
      "add": () => addToFile(url, data),
    })[action]();
  };
  