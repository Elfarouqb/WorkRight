import { motion } from "framer-motion";

const characteristics = [
  { name: "Disability", emoji: "♿" },
  { name: "Race", emoji: "🌍" },
  { name: "Sex", emoji: "👤" },
  { name: "Age", emoji: "📅" },
  { name: "Religion", emoji: "🕊️" },
  { name: "Sexual Orientation", emoji: "🏳️‍🌈" },
  { name: "Gender Reassignment", emoji: "⚧️" },
  { name: "Marriage & Civil Partnership", emoji: "💍" },
  { name: "Pregnancy & Maternity", emoji: "🤰" },
];

export function ProtectedCharacteristics() {
  return (
    <section className="py-16 md:py-20 bg-background border-y border-border">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-xl font-bold mb-3"
          >
            Protected Characteristics in UK Law
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Under the Equality Act 2010, it's unlawful to discriminate against
            someone because of any of these characteristics:
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {characteristics.map((char, index) => (
            <motion.div
              key={char.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-full border border-border hover:border-primary/30 transition-colors"
            >
              <span className="text-lg" role="img" aria-hidden="true">
                {char.emoji}
              </span>
              <span className="font-medium text-sm">{char.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
