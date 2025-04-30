import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LanguageService from './../../services/LanguageService';
import { setLanguages, setPrimaryLanguage } from './../../slices/languageSlice';
import { whitelist } from './../../utils/const'; // Импорт массива
import './LanguagePage.css';

const LanguagePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const languages = useSelector((state) => state.languages.languages);
  const primaryLanguage = useSelector((state) => state.languages.primaryLanguage);
  const [newLanguage, setNewLanguage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    LanguageService.getLanguages()
      .then(data => {
        dispatch(setLanguages(data));
      })
      .catch(err => {
        setError('Не удалось загрузить языки');
      });
  }, [dispatch]);

  const handleAddLanguage = () => {
    if (!newLanguage.trim()) return;

    LanguageService.addLanguage(newLanguage)
      .then(data => {
        dispatch(setLanguages(data));
        setNewLanguage('');
      })
      .catch(err => {
        setError('Ошибка при добавлении языка');
      });
  };

  const handleRemoveLanguage = (language) => {
    LanguageService.removeLanguage(language)
      .then(data => {
        dispatch(setLanguages(data));
      })
      .catch(err => {
        setError('Ошибка при удалении языка');
      });
  };

  const handleChangePrimaryLanguage = (language) => {
    LanguageService.changePrimaryLanguage(language)
      .then(updatedLanguages => {
        const newPrimaryLanguage = updatedLanguages.find(lang => lang.isPrimary);
        dispatch(setLanguages(updatedLanguages));
        dispatch(setPrimaryLanguage(newPrimaryLanguage));
        setError('');
      })
      .catch(err => {
        console.error('Ошибка при изменении главного языка:', err);
        setError(err.message || 'Ошибка при изменении главного языка');
      });
  };

  const handleSelectLanguage = (event) => {
    setNewLanguage(event.target.value);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="language-page">
      <h1 className="language-page__title">Language Management</h1>

      <div className="language-page__add-language">
        <select
          className="language-page__select"
          value={newLanguage}
          onChange={handleSelectLanguage}
        >
          <option value="">Select a language</option>
          {whitelist.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name} ({lang.code.toUpperCase()})
            </option>
          ))}
        </select>
        <button className="language-page__button" onClick={handleAddLanguage}>
          Add Language
        </button>
      </div>

      {error && <p className="language-page__error">{error}</p>}

      <h2 className="language-page__subtitle">
        Primary Language: {primaryLanguage ? primaryLanguage.language : 'Not set'}
      </h2>

      <ul className="language-page__list">
        {languages.map((lang) => (
          <li key={lang.language} className="language-page__item">
            <span className="language-page__item-name">
              {whitelist.find(wl => wl.code === lang.language)?.name || lang.language}
            </span>
            {lang.isPrimary ? (
              <span className="language-page__primary">Main</span>
            ) : (
              <button
                className="language-page__button language-page__button--primary"
                onClick={() => handleChangePrimaryLanguage(lang.language)}
              >
                Set as Main
              </button>
            )}
            <button
              className="language-page__button language-page__button--remove"
              onClick={() => handleRemoveLanguage(lang.language)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <button className="language-page__button language-page__button--home" onClick={handleGoHome}>
        Go to Home
      </button>
    </div>
  );
};

export default LanguagePage;
