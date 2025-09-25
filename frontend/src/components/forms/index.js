/**
 * Forms Components Index
 * Centralized exports for all form components
 */

// Import all form components
import GenreForm from './GenreForm';
import DirectorForm from './DirectorForm';
import ProducerForm from './ProducerForm';
import TypeForm from './TypeForm';
import MediaForm from './MediaForm';

// Individual exports
export { GenreForm };
export { DirectorForm };
export { ProducerForm };
export { TypeForm };
export { MediaForm };

// Default export with all forms grouped
const forms = {
  GenreForm,
  DirectorForm,
  ProducerForm,
  TypeForm,
  MediaForm,
};

export default forms;