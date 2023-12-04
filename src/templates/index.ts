export const replaceTemplateValues = (template: string, jsonData: Record<string, any>) => {
  const keys = Object.keys(jsonData);

  for (const key of keys) {
    const value = jsonData[key];
    template = template.replace(`{{${key}}}`, value);
  }

  return template;
};
