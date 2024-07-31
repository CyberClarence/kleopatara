import { Dices, Import } from "lucide-react";
import { useRef, useState } from "react";

type KeyImporterComponentProps = {
  headingLabel: string;
  validateImportButtonLabel: string;
  validateImportHandler: (keyString: string) => Promise<void>;
  textareaPlaceholder: string;
  generateRandomKeyLabel?: string;
  generateRandomKeyHandler?: () => Promise<string>;
};

export default function KeyImporter(props: KeyImporterComponentProps) {
  // * nos refs
  const inputref = useRef<HTMLInputElement>(null);

  // * notre state
  const [keyString, setKeyString] = useState("");

  // * nos handlers
  const handleFileSelection = () => {
    const { current: fileselector } = inputref;
    fileselector.click();
  };

  const handleFileChosen = (files: FileList) => {
    const file = files.item(0);
    let fileReader = new FileReader();
    fileReader.onloadend = () => {
      setKeyString(fileReader.result.toString());
    };
    fileReader.readAsText(file);
  };

  // * logique custom de cette page
  const handleKeyImport = async () => {
    props.validateImportHandler(keyString);
  };

  // * on découpe notre jolie page en plusieurs petits composant nomé pour permettre de pouvoir
  // * plus facilement lire la structure de page depuis le return terminal
  const PageHeading = () => (
    <div className=" ml-2 text-2xl underline">{props.headingLabel}</div>
  );

  const KeyStringEditor = () => (
    <div className="bg-gray-600 h-1/2 items-center justify-center flex flex-col p-2">
      <span>import from text</span>
      <div className="flex w-full h-full">
        <textarea
          value={keyString}
          placeholder={props.textareaPlaceholder}
          onChange={({ currentTarget }) => setKeyString(currentTarget.value)}
          className="w-full h-full overflow-auto flex bg-gray-801 text-green-600"
        />
        <button className="border h-full" onClick={handleKeyImport}>
          {props.validateImportButtonLabel}
        </button>
      </div>
    </div>
  );

  const ImportOrCreateNewKey = () => (
    <div className="bg-blue-900 h-1/2 flex items-center justify-center gap-8 border">
      {props.generateRandomKeyHandler && props.generateRandomKeyLabel && (
        <div
          className="border rounded p-5 flex items-center gap-6 w-1/2"
          onClick={async () => {
            setKeyString(await props.generateRandomKeyHandler());
          }}
        >
          <p>{props.generateRandomKeyLabel}</p>
          <Dices className="h-6 w-6" />
        </div>
      )}
      <div
        className="border rounded p-5 flex items-center gap-6 w-1/2"
        onClick={handleFileSelection}
      >
        <input
          ref={inputref}
          className="hidden"
          type="file"
          onChange={({ currentTarget }) =>
            handleFileChosen(currentTarget.files)
          }
        />
        <div>Import key from disk</div>

        <div>
          <Import className="w-8 h-8" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full p-4 flex flex-col gap-4 overflow-auto">
      <PageHeading />
      <div className="h-full w-full flex flex-col border p-4 relative overflow-auto ">
        <ImportOrCreateNewKey />
        <KeyStringEditor />
      </div>
    </div>
  );
}
