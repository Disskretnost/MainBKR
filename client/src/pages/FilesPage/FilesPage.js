import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ConferenceFileService from '../../services/ConferenceFileService';
import { setConferenceFiles } from '../../slices/conferenceFilesSlice';
import './FilesPage.css';

const FilesPage = () => {
  const dispatch = useDispatch();
  const { id } = useSelector(state => state.auth.user);
  const files = useSelector(state => state.conferenceFiles.files);

  useEffect(() => {
    if (id) {
      ConferenceFileService.getConferenceFile(id)
        .then(files => {
          dispatch(setConferenceFiles(files));
        })
        .catch(error => {
          console.error('Ошибка при загрузке файлов:', error);
        });
    }
  }, [id, dispatch]);

  const handleDownload = (fileId, filename) => {
    ConferenceFileService.downloadConferenceFile(fileId, filename)
      .catch(error => {
        console.error('Ошибка при скачивании файла:', error);
      });
  };

  return (
    <div className="files-page">
      <h2>Conference Files</h2>
      <div className="files-list">
        {files && files.length > 0 ? (
          <div className="files-grid">
            {files.map(file => (
              <div key={file.id} className="file-item">
                <img 
                  src="pngwing.com.png" 
                  alt="File Icon" 
                  className="file-icon"
                />
                
                <p className="file-date">
                  {new Date(file.createdAt).toLocaleString()}
                </p>
                <button 
                  className="download-button"
                  onClick={() => handleDownload(file.id, file.filename)}
                >
                  Скачать
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>Нет файлов для отображения.</p>
        )}
      </div>
    </div>
  );
};

export default FilesPage;