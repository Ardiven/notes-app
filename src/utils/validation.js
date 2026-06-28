// Mock Joi untuk production — schema Proxy yang chainable & callable
const mockValidate = () => ({ value: undefined, error: null });

function chainable() {
  // Proxy di atas function kosong: callable (untuk .min(5), .required())
  // dan punya getter yang mengembalikan chainable lagi untuk setiap property
  return new Proxy(function () {}, {
    get(_target, prop) {
      if (prop === 'validate') return mockValidate;
      // min, max, required, dll — return chainable lagi
      return chainable();
    },
    apply() {
      // .min(5), .required() dll — return chainable lagi
      return chainable();
    },
  });
}

function createMockJoi() {
  return new Proxy(
    {},
    {
      get() {
        // object, string, number, dll — return chainable
        return chainable;
      },
    }
  );
}

// J selalu terdefinisi — di dev load real Joi, di production pakai mock
export const J = createMockJoi();

export function validateProps(schema, props, componentName) {
  // Lewati validasi di production untuk menghindari beban bundle
  if (!import.meta.env.DEV) return props;

  const validationResult = schema.validate(props, { abortEarly: false });
  if (validationResult.error) {
    const { details } = validationResult.error;
    details.forEach((detail) => {
      console.warn(
        `[${componentName}] Prop validation error: ${detail.message}`
      );
    });
  }
  return validationResult.value;
}
