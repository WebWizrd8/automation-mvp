export const replaceTemplateValues = (template: string, data: string) => {
  const jsonData = JSON.parse(data);

  const keys = Object.keys(jsonData);

  for (const key of keys) {
    const value = jsonData[key];
    template = template.replace(`{{${key}}}`, value);
  }

  return template;
};
