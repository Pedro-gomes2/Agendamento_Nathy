import * as Sentry from '@sentry/node';

export const MonitorPerformance = (threshold = 1000) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - start;

        if (duration > threshold) {
          Sentry.captureMessage(
            `Slow query: ${propertyKey} took ${duration}ms (threshold: ${threshold}ms)`,
            'warning',
          );
        }

        return result;
      } catch (error) {
        const duration = Date.now() - start;
        Sentry.captureException(error, {
          tags: { method: propertyKey, duration },
        });
        throw error;
      }
    };

    return descriptor;
  };
};
