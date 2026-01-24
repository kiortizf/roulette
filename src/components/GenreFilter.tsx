import { QUICK_FILTERS, GenreId } from '@/lib/genres';
import { motion } from 'framer-motion';

interface GenreFilterProps {
  selectedGenres: GenreId[];
  onToggleGenre: (genreId: GenreId) => void;
  onClear: () => void;
}

export default function GenreFilter({ selectedGenres, onToggleGenre, onClear }: GenreFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {QUICK_FILTERS.map((genre) => {
        const isSelected = selectedGenres.includes(genre.id);
        return (
          <motion.button
            key={genre.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggleGenre(genre.id)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              isSelected
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'glass hover:bg-white/10'
            }`}
          >
            <span className="mr-2">{genre.emoji}</span>
            {genre.name}
          </motion.button>
        );
      })}
      
      {selectedGenres.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClear}
          className="px-4 py-2 rounded-full font-medium glass hover:bg-red-500/20 text-red-400"
        >
          Clear Filters
        </motion.button>
      )}
    </div>
  );
}
