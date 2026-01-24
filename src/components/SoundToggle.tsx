import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { soundManager } from '@/lib/sounds';

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  const toggle = () => {
    const newState = soundManager.toggle();
    setEnabled(newState);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
      title={enabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {enabled ? (
        <Volume2 className="w-5 h-5" />
      ) : (
        <VolumeX className="w-5 h-5 text-gray-500" />
      )}
    </motion.button>
  );
}
