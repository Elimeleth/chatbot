import FormData from 'form-data';

export const buildFormData = (params: any) : any => {
const _formdata: FormData = new FormData();
    
   Object.getOwnPropertyNames(params).map(name => {
       if (params[name]) _formdata.append(name, params[name]);
       else if (params[name] === null || params[name] === undefined || !params[name].length) delete params[name]
   });

   return _formdata
}