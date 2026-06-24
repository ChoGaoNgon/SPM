import { useMemo, useState } from 'react';

export function useFileManager() {
    const [initialFiles, setInitialFilesState] = useState([]);
    const [fileList, setFileList] = useState([]);

    const setInitialFiles = (input, urlField = 'filePath') => {
        let files = [];

        if (!Array.isArray(input) && input && input[urlField]) {
            files = [
                {
                    id: input.id,
                    name: input.name,
                    [urlField]: input[urlField],
                },
            ];
        } else if (Array.isArray(input)) {
            files = input;
        }

        const mapped = files.map((f) => {
            const value = f[urlField];
            const url = value ? `${process.env.REACT_APP_UPLOAD_URL}/${value}` : undefined;

            let fileName = '';
            if (value) {
                const parts = value.split('/');
                fileName = parts[parts.length - 1];
            }

            return {
                uid: String(f.id ?? f.uid ?? Math.random()),
                name: fileName || 'file',
                status: 'done',
                url,
                isOld: true,
            };
        });

        setInitialFilesState(mapped);
        setFileList(mapped);
    };

    const onChange = ({ fileList: newList }) => {
        const mapped = newList.map((f) => ({
            ...f,
            isOld: f.isOld ?? false,
        }));
        setFileList(mapped);
    };

    const appendFiles = (files) => {
        if (!Array.isArray(files) || files.length === 0) {
            return;
        }

        const appended = files.filter(Boolean).map((file, index) => ({
            uid: `new-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
            name: file.name || `file-${Date.now()}-${index}`,
            originFileObj: file,
            isOld: false,
        }));

        setFileList((prev) => [...prev, ...appended]);
    };

    const keptOldFiles = useMemo(() => {
        return fileList.filter((f) => f.isOld === true).map((f) => f.name);
    }, [fileList]);

    const deletedOldFiles = useMemo(() => {
        const initialNames = initialFiles.map((f) => f.name);
        const currentNames = fileList.map((f) => f.name);
        return initialNames.filter((name) => !currentNames.includes(name));
    }, [initialFiles, fileList]);

    const newFiles = useMemo(() => {
        return fileList
            .filter((f) => !f.isOld)
            .map((f) => f.originFileObj)
            .filter(Boolean);
    }, [fileList]);

    return {
        fileList,
        setInitialFiles,
        onChange,
        appendFiles,
        keptOldFiles,
        newFiles,
        deletedOldFiles,
    };
}
