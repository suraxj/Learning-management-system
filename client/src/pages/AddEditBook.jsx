import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const INITIAL_STATE = {
  title: '',
  author: '',
  isbn: '',
  genre: '',
  publicationYear: '',
  description: '',
  coverImage: '',
  copies: 1,
  availableCopies: 1,
};

export default function AddEditBook() {
  const { id } = useParams();
  const [form, setForm] = useState(INITIAL_STATE);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.get(`/books/${id}`)
        .then(({ data }) => setForm(data.book))
        .catch(() => toast.error('Failed to load book data'));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...form,
      publicationYear: Number(form.publicationYear),
      copies: Number(form.copies),
      availableCopies: Number(form.availableCopies),
    };

    try {
      if (id) {
        await api.put(`/books/${id}`, payload);
        toast.success('Book updated successfully');
      } else {
        await api.post('/books', payload);
        toast.success('Book added successfully');
      }
      navigate('/admin/books');
    } catch (error) {
      toast.error('An error occurred while saving the book');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-6 grid md:grid-cols-2 gap-4">
      <h1 className="text-2xl font-bold md:col-span-2">
        {id ? 'Edit Book' : 'Add Book'}
      </h1>

      {Object.keys(INITIAL_STATE).map((key) => {
        const isDescription = key === 'description';
        const inputProps = {
          name: key,
          placeholder: key.charAt(0).toUpperCase() + key.slice(1),
          value: form[key] || '',
          onChange: handleChange,
          className: 'border p-3 rounded',
        };

        return isDescription ? (
          <textarea
            key={key}
            {...inputProps}
            className={`${inputProps.className} md:col-span-2`}
          />
        ) : (
          <input
            key={key}
            type={['copies', 'availableCopies', 'publicationYear'].includes(key) ? 'number' : 'text'}
            {...inputProps}
          />
        );
      })}

      <button
        type="submit"
        className="bg-blue-600 text-white p-3 rounded md:col-span-2 hover:bg-blue-700 transition-colors"
      >
        Save
      </button>
    </form>
  );
}