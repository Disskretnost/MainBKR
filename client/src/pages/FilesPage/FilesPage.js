import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ConferenceFileService from '../../services/ConferenceFileService';
import { setConferenceFiles } from '../../slices/conferenceFilesSlice';
import FileItem from '../../components/FileItem/FileItem'; // Импорт компонента
import './FilesPage.css';

const FilesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useSelector(state => state.auth.user);
  const files = useSelector(state => state.conferenceFiles.files);

  const loadFiles = useCallback(() => {
    ConferenceFileService.getConferenceFile(id)
      .then(files => {
        dispatch(setConferenceFiles(files));
      })
      .catch(error => {
        console.error('Ошибка при загрузке файлов:', error);
      });
  }, [id, dispatch]);

  useEffect(() => {
    if (id) {
      loadFiles();
    }
  }, [id, loadFiles]);

  const handleDownload = (fileId, filename) => {
    ConferenceFileService.downloadConferenceFile(fileId, filename)
      .catch(error => {
        console.error('Ошибка при скачивании файла:', error);
      });
  };

  const handleDelete = async (fileId) => {
    try {
      await ConferenceFileService.markFileDeleted(fileId, id);
      loadFiles();
    } catch (error) {
      console.error('Ошибка при удалении файла:', error);
    }
  };

  const goToHomePage = () => {
    navigate('/');
  };

  return (
    <div className="files-page">
      <h2>Conference Files</h2>
      <div className="files-list">
        {files && files.length > 0 ? (
          <div className="files-grid">
            {files.map(file => (
              <FileItem 
                key={file.conferenceId}
                file={file}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <p>There are no files to display.</p>
        )}
      </div>
      
      <div className="home-button-container">
        <button 
          className="home-button"
          onClick={goToHomePage}
        >
          Home page
        </button>
      </div>
    </div>
  );
};

export default FilesPage;