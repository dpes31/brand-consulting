import fs from 'fs';
const content = fs.readFileSync('c:/Users/jiyoun.ru/.gemini/브랜드 컨설팅_v2/참고자료/04) 컨설팅 문서 양식 참고.txt', 'utf8');
const startIndex = content.indexOf('<!DOCTYPE html>');
if (startIndex !== -1) {
    const htmlPart = content.substring(startIndex);
    fs.writeFileSync('c:/Users/jiyoun.ru/.gemini/브랜드 컨설팅_v2/public/template.html', htmlPart);
    console.log('Template extracted and saved to public/template.html');
} else {
    console.log('HTML not found');
}
