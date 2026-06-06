import DocumentAttachment from "./DocumentAttachment";
import PhotoAttachment from "./PhotoAttachment";

export default function Menu() {
  return (
    <ul className="absolute bottom-16 flex flex-col gap-y-3 openEmojiAnimation">
      <DocumentAttachment />
      <PhotoAttachment />
    </ul>
  );
}