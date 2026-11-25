using System;

namespace MobiBoxLite.Domain.Exceptions;

public sealed class NotFoundException : Exception
{
    public NotFoundException()
        : this("The requested resource was not found.")
    {
    }

    public NotFoundException(string message)
        : base(message)
    {
    }

    public NotFoundException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}