import { PATH_FILE_SERVICES_CODES } from "../shared/constants/enviroments"
import { Service } from "../shared/interfaces/api/services-json"
import { loader } from "./loader"

export const services = loader(null, PATH_FILE_SERVICES_CODES) as Service[]

export const service_code = (condition: (code: Service) => boolean) => {
    return services.find(condition) as any

}