using System;

namespace MobiBoxLite.Domain.Exceptions;

public sealed class ConflictException : Exception
{
    public ConflictException()
        : this("The request conflicts with an existing record.")
    {
    }

    public ConflictException(string message)
        : base(message)
    {
    }

    public ConflictException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}