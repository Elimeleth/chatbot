import fs from 'fs';
import { load } from "js-yaml"

const loadYaml = (key: string, filename: string) => {
  const file_content = fs.readFileSync(filename || 'src/messages/messages.yml', 'utf8');

  const data = load(file_content) as any
  
  return data[key] ? String(data[key]).replace(/\n$/, "") : null
}

const loadJson = (filename: string) => {
  try {
    const json_data = fs.readFileSync(filename, 'utf8');
    
    return load(json_data) as any
    
  } catch (error) {
    return null
  }
}

export function loader(key: string|null, filename: string = '') {
  if (filename.includes('json')) {
    return loadJson(filename) as unknown as any
  }

  return loadYaml(key as string, filename) as unknown as string
   
}