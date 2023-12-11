import { Record } from "@prisma/client/runtime/library";

export const replaceTemplateValues = (
  template: string,
  apiData: Record<string, unknown>,
  filterJson: Record<string, unknown>,
) => {
  const keys = Object.keys(apiData);

  for (const key of keys) {
    const value = apiData[key];
    template = template.replace(`{{${key}}}`, value as string);
  }

  const filterKeys = Object.keys(filterJson);

  for (const key of filterKeys) {
    const value = filterJson[key];
    template = template.replace(`{{${key}}}`, value as string);
  }

  return template;
};
